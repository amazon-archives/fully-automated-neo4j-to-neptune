FROM tinkerpop/gremlin-console:3.4.5

ENV NEPTUNE_HOST=0.0.0.0
ENV NEPTUNE_PORT=8080

WORKDIR /opt/gremlin-console/conf
# configure Amazon Neptune
RUN touch neptune-remote.yaml
RUN echo "hosts: ['${NEPTUNE_HOST}']" >> neptune-remote.yaml
RUN echo "port: '${NEPTUNE_PORT}'" >> neptune-remote.yaml
RUN echo 'connectionPool: { enableSsl: true, trustCertChainFile: "SFSRootCAG2.pem"}' >> neptune-remote.yaml
RUN echo 'serializer: { className: org.apache.tinkerpop.gremlin.driver.ser.GryoMessageSerializerV3d0, config: { serializeResultToString: true }}' >> neptune-remote.yaml