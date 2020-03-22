FROM openjdk:11-jdk-slim

ENV NEPTUNE_HOST=0.0.0.0
ENV CONSOLE_DIR=/gremlin-console
ENV CONSOLE_VER=apache-tinkerpop-gremlin-console-3.4.5

WORKDIR ${CONSOLE_DIR}/
RUN apt-get update -y && apt-get install -y wget && apt-get install -y unzip
RUN wget https://archive.apache.org/dist/tinkerpop/3.4.5/${CONSOLE_VER}-bin.zip
RUN unzip apache-tinkerpop-gremlin-console-3.4.5-bin.zip
RUN wget https://www.amazontrust.com/repository/SFSRootCAG2.pem 

COPY neptune-remote.yaml ${CONSOLE_DIR}/${CONSOLE_VER}/conf/
COPY replace-host.sh /
COPY remote-cmd.groovy ${CONSOLE_DIR}/
RUN chmod +x /replace-host.sh
ENTRYPOINT [ "/replace-host.sh" ]

