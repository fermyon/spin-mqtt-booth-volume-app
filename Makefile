SPIN_VARIABLE_MQTT_BROKER_URI ?= "test.mosquitto.org"
SPIN_VARIABLE_MQTT_TOPIC ?= "booth/+"
REGISTRY ?= ghcr.io/fermyon/spin-mqtt-booth-volume
TAG ?= latest
VOLUME ?= 350
BOOTH ?= 20
BROKER_HOSTNAME ?= test.mosquitto.org

all: emqx spin-build-up

emqx:
	docker run -d --name emqx -p 1883:1883 emqx/emqx

spin-build-up:
	SPIN_VARIABLE_MQTT_BROKER_URI=${SPIN_VARIABLE_MQTT_BROKER_URI} SPIN_VARIABLE_MQTT_TOPIC=${SPIN_VARIABLE_MQTT_TOPIC} SPIN_VARIABLE_SQLITE_USERNAME="admin" SPIN_VARIABLE_SQLITE_PASSWORD="password"  spin build --up --sqlite @mqtt-message-persister/migration.up.sql

spin-up:
	SPIN_VARIABLE_MQTT_BROKER_URI=${SPIN_VARIABLE_MQTT_BROKER_URI} SPIN_VARIABLE_MQTT_TOPIC=${SPIN_VARIABLE_MQTT_TOPIC}  SPIN_VARIABLE_SQLITE_USERNAME="admin" SPIN_VARIABLE_SQLITE_PASSWORD="password" spin up --sqlite @mqtt-message-persister/migration.up.sql

pub:
	mqttx pub -t 'booth/${BOOTH}' --hostname ${BROKER_HOSTNAME} --port 1883 --message '{"volume": ${VOLUME}}'

clean:
	docker rm -f emqx

app-apply:
	spin kube scaffold --from ${REGISTRY}:${TAG} --variable mqtt_broker_uri=${SPIN_VARIABLE_MQTT_BROKER_URI} --variable mqtt_topic="booth/+" --variable sqlite_username="admin" --variable sqlite_password=password --replicas 1 | kubectl apply -f -

emqx-apply:
	kubectl apply -f spinkube/broker-configuration/emqx-pod.yaml

mock-device-apply:
	kubectl apply -f spinkube/sound-device.yaml

k8s-clean:
	kubectl delete -f spinkube/broker.yaml
	kubectl delete -f spinkube/sound-device.yaml
	spin kube scaffold --from ${REGISTRY}:${TAG} | kubectl delete -f -
