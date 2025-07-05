import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import {
  CfnIdentityPool,
  CfnIdentityPoolRoleAttachment,
  UserPool,
  UserPoolClient,
} from 'aws-cdk-lib/aws-cognito';
import {
  IdentityPool,
  UserPoolAuthenticationProvider,
  IdentityPoolRoleMapping,
  IdentityPoolProviderUrl,
} from 'aws-cdk-lib/aws-cognito-identitypool';
import { Effect, FederatedPrincipal, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class AuthStack extends Stack {
  public userPool: UserPool;
  private userPoolClient: UserPoolClient;
  // private userIdentityPool: IdentityPool;
  private userIdentityPool: CfnIdentityPool;
  private authenticatedRole: Role;
  private unauthenticatedRole: Role;
  private adminRole: Role;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.createUserPool();
    this.createUserPoolClient();
    this.createUserIdentityPool();
    this.createRoles();
    this.createUserPoolAdminGroup();
    this.attachRolesToIdentityPool();
    // this.addPoliciesToIdentityRoles();
  }

  private createUserPool() {
    this.userPool = new UserPool(this, 'SpaceUserPool', {
      userPoolName: 'SpaceUserPool',
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
      },
    });
    new CfnOutput(this, 'SpaceUserPoolId', {
      value: this.userPool.userPoolId,
    });
  }

  private createUserPoolClient() {
    this.userPoolClient = this.userPool.addClient('SpaceUserPoolClient', {
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userPassword: true,
        userSrp: true,
      },
    });

    new CfnOutput(this, 'SpaceUserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
    });
  }

  private createUserPoolAdminGroup() {
    this.userPool.addGroup('AdminGroup', {
      groupName: 'admins',
      description: 'Group for admin users',
      role: this.adminRole
    });
  }

  private createUserIdentityPool() {
    this.userIdentityPool = new CfnIdentityPool(this, 'SpaceUserIdentityPool', {
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
    });
    new CfnOutput(this, 'SpaceUserIdentityPoolId', {
      value: this.userIdentityPool.ref,
    });
    // this.userIdentityPool = new IdentityPool(this, 'SpaceUserIdentityPool', {
    //   identityPoolName: 'SpaceUserIdentityPool',
    //   allowUnauthenticatedIdentities: true,
    // });

    // this.userIdentityPool.addUserPoolAuthentication(
    //   new UserPoolAuthenticationProvider({
    //     userPool: this.userPool,
    //     userPoolClient: this.userPoolClient,
    //   })
    // );

    // new CfnOutput(this, 'SpaceUserIdentityPoolId', {
    //   value: this.userIdentityPool.identityPoolId,
    // });
  }

  private createRoles() {
    this.authenticatedRole = new Role(this, 'CognitoDefaultAuthenticatedRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.userIdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });

    this.unauthenticatedRole = new Role(this, 'CognitoDefaultUnauthenticatedRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.userIdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });

    this.adminRole = new Role(this, 'CognitoAdminRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.userIdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });
    this.adminRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        's3:Get*',
        's3:ListAllMyBuckets',
        's3:Describe*',
      ],
      resources: ['*']
    }));
  }

  private attachRolesToIdentityPool() {
    new CfnIdentityPoolRoleAttachment(this, 'SpaceUserIdentityPoolRoleAttachment', {
      identityPoolId: this.userIdentityPool.ref,
      roles: {
        authenticated: this.authenticatedRole.roleArn,
        unauthenticated: this.unauthenticatedRole.roleArn,
      },
      roleMappings: {
        adminsMapping: {
          type: 'Token',
          ambiguousRoleResolution: 'AuthenticatedRole',
          identityProvider: `${this.userPool.userPoolProviderName}:${this.userPoolClient.userPoolClientId}`,
        },
      },
    });
  }
}
