start-services:
	- ./docker/scripts/init.sh
stop-services:
	- docker compose down
build:
	- docker build -f ./Dockerfile-prod -t ms-zenvia-container:latest .
start:
	- docker run --name ms-zenvia-container -p 5023:80 -d ms-zenvia-container:latest
exec:
	- docker exec -it ms-zenvia-container /bin/sh
logs:
	- docker logs -f --tail 50 --timestamps ms-zenvia-container
