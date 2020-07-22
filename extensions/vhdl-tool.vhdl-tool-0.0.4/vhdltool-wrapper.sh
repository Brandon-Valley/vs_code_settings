#!/bin/sh

export WRAPPER_PATH=`which vhdl-tool`

if [ "X" = "X$WRAPPER_PATH" ]; then
  echo "Content-Length: 100\r\n\r"
  echo '{"jsonrpc":"2.0","id":1,"error":{"code":-32099,"message":"Cannot find vhdl-tool executable in $PATH"}}'
  exit 1
fi

vhdl-tool lsp
