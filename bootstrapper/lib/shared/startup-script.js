// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const StartupScript = () => {
	const setupDockerScript = ({
		neo4jEc2,
		neo4j_pwd,
		s3Bucket,
		neptune_host,
		neptune_role,
		aws_region
	}) => {
		const init = [
			"sudo su #",
			"yum update -y",
			"export NEO4J_PASSWORD=" + neo4j_pwd,
			"export S3BUCKET_NAME=" + s3Bucket,
			"export NEPTUNE_HOST=" + neptune_host,
			"export NEPTUNE_ROLE=" + neptune_role,
			"export AWS_REGION=" + aws_region
		];
		neo4jEc2.addUserData(init.join("\n"));

		// install docker
		const installDocker = [
			"cd /",
			"mkdir temp",
			"amazon-linux-extras install docker",
			"service docker start",
			"usermod -a -G docker ec2-user"
		];
		neo4jEc2.addUserData(installDocker.join("\n"));

		const neo4jDocker = [
			'docker run -d -e NEO4J_PASSWORD -e S3BUCKET_NAME -e NEPTUNE_HOST -e NEPTUNE_ROLE -e AWS_REGION --name neo4j-400 --mount type=bind,source="$(pwd)"/temp,target=/var/lib/neo4j/output sanjeets/neo4j-400-export:latest && docker exec -it -e NEO4J_PASSWORD -e S3BUCKET_NAME -e NEPTUNE_HOST -e NEPTUNE_ROLE -e AWS_REGION neo4j-400 sh -c ./main.sh'
		];
		neo4jEc2.addUserData(neo4jDocker.join("\n"));

		const uploadDataToS3 = [
			'aws s3 cp /temp/ s3://"${S3BUCKET_NAME}"/neo4j-data --recursive'
		];
		neo4jEc2.addUserData(uploadDataToS3.join("\n"));

		// interactive start gremlin console: docker run -it -e NEPTUNE_HOST sanjeets/neptune-gremlinc-345:latest
	};

	return { setStartupScript, setupDockerScript };
};

module.exports = { StartupScript };
