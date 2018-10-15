start cmd /k launch_db_server
echo Waiting for db server to open connection
timeout /t 3 /nobreak

cd %~dp0\BackEnd
npm test && npm start
cmd /kq