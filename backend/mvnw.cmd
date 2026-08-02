@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script for TriageNet Backend
@REM ----------------------------------------------------------------------------
@echo off
set MVN_CMD=C:\Users\priya\.m2\wrapper\dists\apache-maven-3.9.16\0daed3be3ebd1c706f0e69e8b07c6b73f5cc4ea3dfce72a8d0ec2e849ca2ddb0\bin\mvn.cmd
if exist "%MVN_CMD%" (
    "%MVN_CMD%" %*
) else (
    mvn %*
)
