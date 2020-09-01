import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecr from '@aws-cdk/aws-ecr';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';

export interface ServiceStackProps extends cdk.StackProps {

  repository: ecr.IRepository,

  imageTag: string,
}

export class ServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'MyVpc', {
      cidr: '192.168.0.0/22',
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: 'Private', 
          subnetType: ec2.SubnetType.PRIVATE
        },
      ],
      maxAzs: 2
    });

    const cluster = new ecs.Cluster(this, 'Cluster', {
      clusterName: 'cdk-cicd',
      vpc: vpc,
    });

    new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'Service', {
      cluster: cluster,
      cpu: 256,
      memoryLimitMiB: 512,
      desiredCount: 2,
      taskImageOptions: {
        containerName: 'app',
        containerPort: 8080,
        image: ecs.ContainerImage.fromEcrRepository(props.repository, props.imageTag),
      },
      publicLoadBalancer: true,
    });
  }
}
