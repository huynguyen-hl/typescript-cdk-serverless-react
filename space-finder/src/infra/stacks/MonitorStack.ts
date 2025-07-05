import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Alarm, Metric, Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

export class MonitorStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const spaceApi4xxAlarm = new Alarm(this, 'spaceApi4xxAlarm', {
      alarmName: 'spaceApi4xxAlarm',
      metric: new Metric({
        metricName: '4XXError',
        namespace: 'AWS/ApiGateway',
        period: Duration.minutes(1),
        statistic: 'Sum',
        unit: Unit.COUNT,
        dimensionsMap: {
          ApiName: 'SpacesApi',
        },
      }),
      evaluationPeriods: 1,
      threshold: 5,
    });

    const spaceApiTopic = new Topic(this, 'ApiSpaceSnsTopic', {
      topicName: 'ApiSpaceSnsTopic',
      fifo: false,
    });
    spaceApiTopic.addSubscription(new EmailSubscription('scythedead.h@gmail.com'))

    spaceApi4xxAlarm.addAlarmAction(new SnsAction(spaceApiTopic));

  }
}
