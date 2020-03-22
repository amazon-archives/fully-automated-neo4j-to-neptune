#!/bin/bash
sed -i "s/REPLACE_HOST_ADDRESS/${NEPTUNE_HOST}/g" ${CONSOLE_DIR}/${CONSOLE_VER}/conf/neptune-remote.yaml
exec ${CONSOLE_VER}/bin/gremlin.sh -i ../remote-cmd.groovy

