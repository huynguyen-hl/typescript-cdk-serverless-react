import { App, Resource } from 'aws-cdk-lib';
import { MonitorStack } from '../../../src/infra/stacks/MonitorStack';
import { Capture, Match, Template } from 'aws-cdk-lib/assertions';

describe('MonitorStack test suite', () => {
  let monitorStackTemplate: Template;
  let snsTopicResource: ReturnType<typeof monitorStackTemplate.findResources>;
  let emailSubscriptionResource: ReturnType<typeof monitorStackTemplate.findResources>;
  let cloudwatchAlarmResource: ReturnType<typeof monitorStackTemplate.findResources>;

  beforeAll(() => {
    const app = new App({
      outdir: 'cdk.out',
    });

    const monitorStack = new MonitorStack(app, 'MonitorStack');
    monitorStackTemplate = Template.fromStack(monitorStack);
    snsTopicResource = monitorStackTemplate.findResources('AWS::SNS::Topic');
    emailSubscriptionResource = monitorStackTemplate.findResources('AWS::SNS::Subscription');
    cloudwatchAlarmResource = monitorStackTemplate.findResources('AWS::CloudWatch::Alarm');
  });

  it('should correct SNS topic config', () => {
    monitorStackTemplate.hasResourceProperties('AWS::SNS::Topic', {
      FifoTopic: false,
      TopicName: 'ApiSpaceSnsTopic',
    });
  });

  it('should correct SNS subscription config - with Matcher', () => {
    monitorStackTemplate.hasResourceProperties(
      'AWS::SNS::Subscription',
      Match.objectEquals({
        Endpoint: 'scythedead.h@gmail.com',
        Protocol: 'email',
        TopicArn: {
          Ref: Match.stringLikeRegexp('ApiSpaceSnsTopic'),
        },
      })
    );
  });

  it('should correct CloudWatch Alarm config - with Matcher', () => {
    monitorStackTemplate.hasResourceProperties(
      'AWS::CloudWatch::Alarm',
      Match.objectEquals({
        AlarmActions: [
          {
            Ref: Match.stringLikeRegexp('ApiSpaceSnsTopic'),
          },
        ],
        AlarmName: 'spaceApi4xxAlarm',
        ComparisonOperator: 'GreaterThanOrEqualToThreshold',
        Dimensions: [
          {
            Name: 'ApiName',
            Value: 'SpacesApi',
          },
        ],
        EvaluationPeriods: 1,
        MetricName: '4XXError',
        Namespace: 'AWS/ApiGateway',
        Period: 60,
        Statistic: 'Sum',
        Threshold: 5,
        Unit: 'Count',
      })
    );
  });

  it('should correct SNS subscription config - with exact', () => {
    const snsTopicGeneratedName = Object.keys(snsTopicResource)[0];

    monitorStackTemplate.hasResourceProperties('AWS::SNS::Subscription', {
      Endpoint: 'scythedead.h@gmail.com',
      Protocol: 'email',
      TopicArn: {
        Ref: snsTopicGeneratedName,
      },
    });
  });

  it('should correct CloudWatch Alarm config - with exact', () => {
    const snsTopicGeneratedName = Object.keys(snsTopicResource)[0];

    monitorStackTemplate.hasResourceProperties(
      'AWS::CloudWatch::Alarm',
      Match.objectEquals({
        AlarmActions: [
          {
            Ref: snsTopicGeneratedName,
          },
        ],
        AlarmName: 'spaceApi4xxAlarm',
        ComparisonOperator: 'GreaterThanOrEqualToThreshold',
        Dimensions: [
          {
            Name: 'ApiName',
            Value: 'SpacesApi',
          },
        ],
        EvaluationPeriods: 1,
        MetricName: '4XXError',
        Namespace: 'AWS/ApiGateway',
        Period: 60,
        Statistic: 'Sum',
        Threshold: 5,
        Unit: 'Count',
      })
    );
  });

  it('should correct AlarmActions config', () => {
    const alarmActionsCapture = new Capture();
    monitorStackTemplate.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmActions: alarmActionsCapture,
    });

    expect(alarmActionsCapture.asArray()).toEqual([
      {
        Ref: expect.stringMatching(/^ApiSpaceSnsTopic/),
      },
    ]);
  });

  it('should match MonitorStack snapshot', () => {
    expect(monitorStackTemplate.toJSON()).toMatchSnapshot();
  });

  it('should match SNS Topic snapshot', () => {
    expect(snsTopicResource).toMatchSnapshot();
  });

  it('should match SNS Email Subscription snapshot', () => {
    expect(emailSubscriptionResource).toMatchSnapshot();
  });

  it('should match Cloudwatch Alarm snapshot', () => {
    expect(cloudwatchAlarmResource).toMatchSnapshot();
  });
});
