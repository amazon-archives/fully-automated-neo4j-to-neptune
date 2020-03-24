# Overview

This AWS CDK app helps you migrate the simple Neo4j movies graph database to
Amazon Neptune in a hands-free, fully-automated way

# Architecture

![architecture](/bootstrapper/images/neo4j-neptune.png)

# Prerequisites

- Install
  [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- Install [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Install](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
  and
  [Configure](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)
  [AWS CLI](https://aws.amazon.com/cli/)
- The [IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id.html)
  configured in the AWS profile must have the privileges to provision the
  following resources. Please note, while working with AWS acounts, IAM users
  and policies always follow
  [IAM best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html):
  - Amazon VPC and Subnets
  - Amazon EC2 instance
  - Amazon S3 bucket
  - Amazon S3 Gateway VPC Endpoint
  - An Amazon Neptune cluster
- Install
  [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html)

# Configuration

- Verify the app specific configuration saved in `bootstrapper/cdk.json` to
  ensure you have the right values for your environment
  - (Required) replace `<your-key-pair-name>` with your own
    [EC2 key pair](https://docs.aws.amazon.com/AWSEC2/latest/WindowsGuide/ec2-key-pairs.html#having-ec2-create-your-key-pair)
    name e.g. `my-us-west-2-key-pair`
  - (Required) replace `<provide-your-ip>` with your current IP address e.g.
    8.8.8.8/32 [Know your IP address](https://www.whatsmyip.org/)

The contents of the file looks like this. Feel free to change the values before
running the app

```
{
	"app": "node bin/bootstrapper.js",
	"context": {
		"vpc_cidr": "192.168.0.0/16",
		"ec2_class": "t3a",
		"ec2_type": "xlarge",
		"ec2_key_pair": "<your-key-pair-name>",
		"sg_fromIp": "<provide-your-ip>"
	}
}
```

# Download

Download the code using the following git command

```
$ git clone https://github.com/aws-samples/fully-automated-neo4j-to-neptune.git
```

# Run

Run the app

```
$ cd fully-automated-neo4j-to-neptune/bootstrapper
$ npm install
$ npm run deploy
```

Detailed architecture
![architecture](/bootstrapper/images/migrating-blog-sys-arch.png)

The app will ask questions while showing you what it's trying to create. Just
respond with a 'y' to let it do its stuff. It will take about 10 minutes to
deploy the infrastructure and run the required code to automate the migration.

When you run the app the following are downloaded and installed:

- Neo4j community edition version 4.0.0 using `yum install neo4j-4.0.0 -y`
- Apache TinkerPop Gremlin Console 3.4.5 from
  `http://apache.mirrors.spacedump.net/tinkerpop/3.4.5/apache-tinkerpop-gremlin-console-3.4.5-bin.zip`
- Neo4j movies graph cypher script
  `https://raw.githubusercontent.com/sahays/fully-automated-neo4j-to-neptune/master/bootstrapper/movies-cypher.txt`
- Neo4j APOC plugin version 4.0.0.2
  `https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/4.0.0.2/apoc-4.0.0.2-all.jar`
- Neo4j-to-Neptune tool
  `https://github.com/awslabs/amazon-neptune-tools/tree/master/neo4j-to-neptune`
- Customized Docker repositories
  - Neo4j docker: https://hub.docker.com/repository/docker/sanjeets/neo4j-400-export
  - Gremlin console docker: https://hub.docker.com/repository/docker/sanjeets/neptune-gremlinc-345

After running the app, you'll see an output similar to the following:
![output](/bootstrapper/images/migrating-stack-output.png)

Please note: the code uses the `default` AWS CLI profile

# Destroy

To cleanup after you are done

```
$ npm run destroy
```

Please note: this command doesn't delete the Amazon S3 bucket it creates, you'll
have to do it manually
