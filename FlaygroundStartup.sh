#!/bin/sh

CURRENT_DIR=${PWD}
FLAYGROUND_HOME="$CURRENT_DIR"
JAVA_OPTS="$JAVA_OPTS -Dspring.profiles.active=flay-wsl"
JAVA_OPTS="$JAVA_OPTS -Dfile.encoding=UTF-8"
JAVA_OPTS="$JAVA_OPTS -Djava.awt.headless=true"
JAVA_OPTS="$JAVA_OPTS -Djava.net.preferIPv4Stack=true"
JAVA_OPTS="$JAVA_OPTS -XX:+UseG1GC -XX:+DisableExplicitGC -XX:+UseStringDeduplication"
JAVA_OPTS="$JAVA_OPTS -Dlogging.file.name=flayground.log"

echo "Using FLAYGROUND: $FLAYGROUND_HOME"
echo "Using JAVA_HOME:  $JAVA_HOME"
echo "Using JAVA_OPTS:  $JAVA_OPTS"

$JAVA_HOME/bin/java $JAVA_OPTS -jar $FLAYGROUND_HOME/Flayground.jar
