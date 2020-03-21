// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/*
docker run -d --env NEO4J_AUTH=neo4j/pass@word1 \
--name neo4j-400-export -p7474:7474 -p7687:7687 \
-v $HOME/neo4j/logs:/logs  \
neo4j-400-export
*/

// build docker image
// run container
// exec command

const StartupScript = () => {
  const setStartupScript = (
    neo4jEc2,
    neptuneCluster,
    s3Bucket,
    roleArn,
    neo4j_uid,
    neo4j_pwd,
    neptunePort
  ) => {
    const setup = [
      "sudo su #",
      "yum update -y",
      "rpm --import https://debian.neo4j.com/neotechnology.gpg.key",
      'echo "[neo4j]" >> /etc/yum.repos.d/neo4j.repo',
      'echo "name=Neo4j RPM Repository" >> /etc/yum.repos.d/neo4j.repo',
      'echo "baseurl=https://yum.neo4j.com/stable" >> /etc/yum.repos.d/neo4j.repo',
      'echo "enabled=1" >> /etc/yum.repos.d/neo4j.repo',
      'echo "gpgcheck=1" >> /etc/yum.repos.d/neo4j.repo',
      "amazon-linux-extras enable java-openjdk11",
      "yum install neo4j-4.0.0 -y",
      "systemctl enable neo4j",
      "systemctl stop neo4j",
      'echo "apoc.export.file.enabled=true" >> /etc/neo4j/neo4j.conf',
      'echo "dbms.security.procedures.unrestricted=apoc.*" >> /etc/neo4j/neo4j.conf',
      "echo NEO4J_ULIMIT_NOFILE=60000 >> /etc/default/neo4j",
      "neo4j-admin set-initial-password " + neo4j_pwd,
      "wget --directory-prefix /var/lib/neo4j/plugins/ https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/4.0.0.2/apoc-4.0.0.2-all.jar",
      "systemctl start neo4j"
    ];
    neo4jEc2.addUserData(setup.join("\n"));

    const gremlinInstall = [
      "cd /",
      "yum install unzip",
      "wget http://apache.mirrors.spacedump.net/tinkerpop/3.4.5/apache-tinkerpop-gremlin-console-3.4.5-bin.zip",
      "unzip apache-tinkerpop-gremlin-console-3.4.5-bin.zip",
      "cd apache-tinkerpop-gremlin-console-3.4.5/",
      "wget https://www.amazontrust.com/repository/SFSRootCAG2.pem"
    ];
    neo4jEc2.addUserData(gremlinInstall.join("\n"));

    const neptuneConfig = [
      "cd conf/",
      "touch neptune-remote.yaml",
      'echo "hosts: [' +
        neptuneCluster.attrEndpoint +
        ']" >> neptune-remote.yaml',
      'echo "port: ' + neptunePort + '" >> neptune-remote.yaml',
      'echo "connectionPool: { enableSsl: true, trustCertChainFile: "SFSRootCAG2.pem"}" >> neptune-remote.yaml',
      'echo "serializer: { className: org.apache.tinkerpop.gremlin.driver.ser.GryoMessageSerializerV3d0, config: { serializeResultToString: true }}" >> neptune-remote.yaml'
    ];
    neo4jEc2.addUserData(neptuneConfig.join("\n"));

    const exportData = [
      "cd /",
      "wget https://raw.githubusercontent.com/aws-samples/fully-automated-neo4j-to-neptune/master/bootstrapper/movies-cypher.txt",
      "wget https://d1rwcpsuqsa5hl.cloudfront.net/neo4j-to-neptune.jar",
      "cypher-shell -u " +
        neo4j_uid +
        " -p " +
        neo4j_pwd +
        " -f movies-cypher.txt",
      "echo \"CALL apoc.export.csv.all('neo4j-export.csv', {d:','});\" >> apoc-export.txt",
      "cypher-shell -u " +
        neo4j_uid +
        " -p " +
        neo4j_pwd +
        " -f apoc-export.txt",
      "java -jar neo4j-to-neptune.jar convert-csv -i /var/lib/neo4j/import/neo4j-export.csv -d output --infer-types",
      "aws s3 cp /output/ s3://" +
        s3Bucket.bucketName +
        "/neo4j-data --recursive"
    ];
    neo4jEc2.addUserData(exportData.join("\n"));

    const loadToNeptune =
      "curl -X POST " +
      "-H 'Content-Type: application/json' https://" +
      neptuneCluster.attrEndpoint +
      ":" +
      neptunePort +
      "/loader -d '" +
      JSON.stringify({
        source: "s3://" + s3Bucket.bucketName + "/neo4j-data",
        format: "csv",
        iamRoleArn: roleArn,
        region: process.env.CDK_DEFAULT_REGION,
        failOnError: false
      }) +
      "'\n";
    neo4jEc2.addUserData(loadToNeptune);
  };

  const setupDockerScript = () => {
    const installDocker = [
      "sudo su #",
      "cd /",
      "yum update -y",
      "amazon-linux-extras install docker",
      "service docker start",
      "usermod -a -G docker ec2-user",
      "docker info"
    ];
    neo4jEc2.addUserData(installDocker.join("\n"));

    // docker image build -t neo4j-400-export . && docker run -d --name neo4j-400 neo4j-400-export:latest && docker exec -it neo4j-400 bash ./main.sh
    // 
    // 

    // docker container stop neo4j-400 && docker container prune
    // docker container start neo4j-400
    // docker exec -it neo4j-400 cypher-shell :exit;
    // docker container prune

    const runNeo4jContainer=["docker run -d --name neo4j-400 --env NEO4J_AUTH=neo4j/pass@word1 -p7474:7474 -p7687:7687 sanjeets/neo4j-400-export","docker exec -t neo4j-400 "];
    neo4jEc2.addUserData(runNeo4jContainer.join("\n"));
  };

  return { setStartupScript, setupDockerScript };
};

module.exports = { StartupScript };
