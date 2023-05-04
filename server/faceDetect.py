import tensorflow.keras
from PIL import Image, ImageOps
import numpy as np
import cv2 
import random
import time
import  sys
from  Adafruit_IO import  MQTTClient

AIO_FEED_ID = ["bbc-led", "bbc-fan", "bbc-rgb"]
AIO_USERNAME = "ntr18"
AIO_KEY = "aio_sYBT12frtgJHKgZXbiDN5lKrECht"
AIO_OUT = ["bbc-temp", "bbc-hum", "bbc-hex", "bbc-ass"]
def  connected(client):
    print("Ket noi thanh cong...")
    for feed in AIO_FEED_ID:
        client.subscribe(feed)

def  subscribe(client , userdata , mid , granted_qos):
    print("Subscribe thanh cong...")

def  disconnected(client):
    print("Ngat ket noi...")
    sys.exit (1)

def  message(client , feed_id , payload):
    print("Nhan du lieu: " + payload)

client = MQTTClient(AIO_USERNAME , AIO_KEY)
client.on_connect = connected
client.on_disconnect = disconnected
client.on_message = message
client.on_subscribe = subscribe
client.connect()
client.loop_background()

cam = cv2.VideoCapture(0)

def capture_image():
    ret, frame = cam.read()
    cv2.imwrite('img_detect.png', frame)


def face_detection():
    # Disable scientific notation for clarity
    np.set_printoptions(suppress=True)

    # Load the model
    model = tensorflow.keras.models.load_model('keras_model.h5')

    # Create the keras model
    data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)

    # Replace this with the path to your image
    image = Image.open('img_detect.png')

    # resize the image to a 224x224
    size = (224, 224)
    image = ImageOps.fit( image, size, Image.ANTIALIAS )

    # turn the image into a numpy array
    image_array = np.asarray(image)

    # display the resized image
    image.show()

    # Normalize the image
    normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1

    # Load the image into the array
    data[0] = normalized_image_array

    prediction = model.predict(data)
    print(prediction)

    name = ['user', 'stranger', 'nothing']
    index = -1
    max_value = -1
    for i in range(0, len(prediction[0])):
        if max_value < prediction[0][i]:
            max_value = prediction[0][i]
            index = i
    return name[index], max_value    

while True:
    capture_image()
    res, mes = face_detection()    
    value = random.randint(0, 100)
    print("Cap nhat:", value)
    print(res)
    # client.publish("bbc-temp", value)
    # client.publish("bbc-hum", value)
    # client.publish("bbc-hex", value)
    client.publish("bbc-ass", res)
    client.publish("bbc-ai",res)
    time.sleep(30)