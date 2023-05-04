import sounddevice
from scipy.io.wavfile import write
import tensorflowjs
import scipy.io.wavfile as wf
import numpy as np
from python_speech_features import fbank
import time
import  sys
from  Adafruit_IO import  MQTTClient
# model = tensorflowjs.converters.load_keras_model("model.json")
# print(model.summary())

LENGTH = 43
NUM_FBANKS = 232
EXT = 'wav'

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

def recordAudio():
    fs = 44100
    seconds = 2
    print("Bat dau")
    myrecording = sounddevice.rec(int(seconds*fs),samplerate = fs, channels=2)
    sounddevice.wait()
    print("Ket thuc")
    write('audio.wav',fs, myrecording)

def read_mfcc(input_filename):
    sample_rate, audio = wf.read(input_filename)
    audio = (audio [:, 0] + audio[:, 1]) / 2 # Convert to Mono
    energy = np.abs(audio)
    silence_threshold = np.percentile(energy, 95)
    offsets = np.where(energy > silence_threshold) [0]

    vad = VoiceActivityDetection()
    vad.process(audio)
    voice_samples = vad.get_voice_samples()
    audio_voice_only = voice_samples

    mfcc = mfcc_fbank(audio_voice_only, sample_rate)
    return mfcc


# Apply to remove silence
class VoiceActivityDetection :

    def __init__(self):
        self.__step = 160
        self.__buffer_size = 160
        self.__buffer = np.array([], dtype = np.int16)
        self.__out_buffer = np.array([], dtype = np.int16)
        self.__n = 0
        self.__VADthd = 0.
        self.__VADn = 0.
        self.__silence_counter = 0

    def vad (self, _frame):
        frame = np.array(_frame) ** 2.
        result = True
        threshold = 0.1
        thd = np.min(frame) + np.ptp(frame) * threshold
        self.__VADthd = (self.__VADn * self.__VADthd + thd) / float(self.__VADn + 1.)
        self.__VADn += 1.

        if np.mean(frame) <= self.__VADthd :
            self.__silence_counter += 1
        else :
            self.__silence_counter = 0

        if self.__silence_counter > 20:
            result = False
        return result

# Push new audio samples into the buffer .

    def add_samples(self, data) :
        self.__buffer = np.append(self.__buffer, data)
        result = len(self.__buffer) >= self.__buffer_size
        return result

    # Pull a portion of the buffer to process
    # ( pulled samples are deleted after being
    # processed
    def get_frame(self) :
        window = self.__buffer[:self.__buffer_size]
        self.__buffer = self.__buffer[self.__step:]
        return window

    # Adds new audio samples to the internal
    # buffer and process them
    def process(self, data):
        if self.add_samples(data):
            while len(self.__buffer) >= self.__buffer_size :
                # Framing
                window = self.get_frame()
                # print('window size %i'% window.size)
                if self.vad(window) : # speech frame
                    self.__out_buffer = np.append(self.__out_buffer, window)
                # print('__out_buffer size %i'% self.__out_buffer.size)

    def get_voice_samples(self) :
        return self.__out_buffer


def pad_mfcc(mfcc, max_length) : # num_frames, nfilt =64.
    if len(mfcc) < max_length :
        mfcc = np.vstack((mfcc, np.tile(np.zeros(mfcc.shape[1]), (max_length - len(mfcc), 1))))
    return mfcc


def mfcc_fbank (signal : np.array, sample_rate : int) : # 1D signal array.
    # Returns MFCC with shape (num_frames, n_filters, 3).
    filter_banks, energies = fbank(signal, samplerate = sample_rate, nfilt = NUM_FBANKS)
    frames_features = normalize_frames(filter_banks)
    return np.array(frames_features, dtype = np.float32) # Float32 precision is enough here.


def normalize_frames(m, epsilon=1e-12) :
    return [(v - np.mean(v)) / max(np.std(v), epsilon) for v in m ]


def audio_detection():
    audio = read_mfcc("audio.wav")
    model = tensorflowjs.converters.load_keras_model("model.json")
    input_data = np.expand_dims(audio[:LENGTH], -1)
    batch = np.empty(((1, input_data.shape[0], 232, 1)), dtype = np.float32)
    batch[0] = input_data

    prediction = model.predict(batch)
    name = ["Background", "turn on", "turn off"]
    index = -1
    max_value = -1
    for i in range (0, len(prediction[0])):
        if max_value < prediction[0][i]:
            max_value = prediction[0][i]
            index = i
    print("Ket Qua: ", name[index])
    print("Chinh Xac: ", max_value)

    return name[index]

time.sleep(20)

while (True):
    recordAudio()
    voice = audio_detection()
    if voice == "turn on":
        client.publish("bbc-led","1")
    elif voice == "turn off":
        client.publish("bbc-led","0")
    time.sleep(20)
