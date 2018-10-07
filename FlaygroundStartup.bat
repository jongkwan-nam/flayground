@echo off
chcp 65001
setlocal

set "CURRENT_DIR=%cd%"
set "FLAYGROUND_HOME=%CURRENT_DIR%"
set "JAVA_OPTS=%JAVA_OPTS% -Dspring.profiles.active=flay-home"

echo Using FLAYGROUND_HOME:  %FLAYGROUND_HOME%
echo Using       JAVA_HOME:  %JAVA_HOME%
echo Using       JAVA_OPTS:  %JAVA_OPTS%

"%JAVA_HOME%"\bin\java.exe %JAVA_OPTS% -jar "%FLAYGROUND_HOME%\target\flayground.jar"
