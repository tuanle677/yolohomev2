import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const LoginScreen(),
    );
  }
}

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Login'),
      ),
      body: Center(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Container(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 70),
              child: const FlutterLogo(
                size: 40,
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: TextField(
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(90.0),
                  ),
                  labelText: 'Email',
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: TextField(
                obscureText: true,
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(90.0),
                  ),
                  labelText: 'Password',
                ),
              ),
            ),
            Container(
              height: 80,
              padding: const EdgeInsets.all(20),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                ),
                child: const Text('Log In'),
                onPressed: () {
                  // Navigate to HomePage after login
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const HomePage()),
                  );
                },
              ),
            ),
            TextButton(
              onPressed: () {},
              child: Text(
                'Forgot Password?',
                style: TextStyle(color: Colors.grey[600]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home Page'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () {
                // Navigate to MyHomePage (Control page)
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const MyHomePage()),
                );
              },
              child: const Text('Control'),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Navigate to StatisticPage
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const StatisticPage()),
                );
              },
              child: const Text('Statistic'),
            ),
          ],
        ),
      ),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  late IO.Socket socket;

  // State for each channel ('0' = off, '1' = on)
  Map<String, String> channelStates = {
    'atom': '0',
    'atom2': '0',
    'atom3': '0',
    'atom4': '0',
  };

  // Controllers for countdown input
  final Map<String, TextEditingController> countdownControllers = {
    'atom': TextEditingController(),
    'atom2': TextEditingController(),
    'atom3': TextEditingController(),
    'atom4': TextEditingController(),
  };

  // To store the countdown values
  Map<String, int?> countdownValues = {
    'atom': null,
    'atom2': null,
    'atom3': null,
    'atom4': null,
  };

  @override
  void initState() {
    super.initState();
    _connectSocket();
  }

  void _connectSocket() {
    // Connect to the Node.js server
    socket = IO.io('http://localhost:3001', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });
    socket.connect();

    // Listen for connection
    socket.onConnect((_) {
      print('Connected to server');
    });

    // Handle disconnection
    socket.onDisconnect((_) {
      print('Disconnected from server');
    });
  }

  // Toggle channel state and send data
  void _toggleChannel(String channel) {
    setState(() {
      channelStates[channel] = channelStates[channel] == '0' ? '1' : '0';
      socket.emit(channel, channelStates[channel]);
    });
  }

  // Start the countdown timer
  void _startCountdown(String channel) {
    int? countdown = int.tryParse(countdownControllers[channel]!.text);

    if (countdown != null && countdown > 0) {
      setState(() {
        countdownValues[channel] = countdown;
      });

      Timer.periodic(const Duration(seconds: 1), (timer) {
        if (countdownValues[channel]! > 1) {
          setState(() {
            countdownValues[channel] = countdownValues[channel]! - 1;
          });
        } else {
          timer.cancel();
          setState(() {
            countdownValues[channel] = null;
          });
          _toggleChannel(channel); // Toggle the state when countdown finishes
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Control Page'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(0.0),
        child: Row(
          children: [
            // Column for the buttons
            Expanded(
              flex: 2,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildControlWithCountdown('atom', 'Control Atom 1:'),
                  _buildControlWithCountdown('atom2', 'Control Atom 2:'),
                  _buildControlWithCountdown('atom3', 'Control Atom 3:'),
                  _buildControlWithCountdown('atom4', 'Control Atom 4:'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildControlWithCountdown(String channel, String label) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 15),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          ElevatedButton(
            onPressed: () => _toggleChannel(channel),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontSize: 12),
                ),
                const SizedBox(width: 10),
                Text(
                  channelStates[channel] == '0' ? 'OFF' : 'ON',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: channelStates[channel] == '0'
                        ? Colors.red
                        : Colors.green,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 100,
                  child: TextField(
                    controller: countdownControllers[channel],
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Timer',
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () => _startCountdown(channel),
                  child: const Text('Start'),
                ),
              ],
            ),
          ),
          if (countdownValues[channel] != null)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                'Timer: ${countdownValues[channel]}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    for (var controller in countdownControllers.values) {
      controller.dispose();
    }
    socket.dispose();
    super.dispose();
  }
}

class StatisticPage extends StatefulWidget {
  const StatisticPage({super.key});

  @override
  _StatisticPageState createState() => _StatisticPageState();
}

class _StatisticPageState extends State<StatisticPage> {
  late IO.Socket socket;
  double voltage = 0.0; // To store the latest voltage value

  @override
  void initState() {
    super.initState();
    _connectSocket();
  }

  void _connectSocket() {
    // Connect to the feed 'topic' via the WebSocket
    socket = IO.io('http://localhost:3001', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });
    socket.connect();

    // Listen for connection
    socket.onConnect((_) {
      print('Connected to server');
    });

    // Listen for voltage updates from the 'topic' feed
    socket.on('topic', (data) {
      setState(() {
        try {
          // Assuming data is a string like "{message: 'Received data from dynabit/feeds/topic: 220.11'}"
          String message =
              data['message']; // Extract the 'message' field from the map

          // Use RegExp to extract the number from the message
          RegExp regex = RegExp(
              r'([0-9]+\.[0-9]+)'); // Regular expression to capture floating-point numbers
          Match? match = regex.firstMatch(message);

          if (match != null) {
            voltage = double.parse(
                match.group(0)!); // Parse the captured voltage value
          } else {
            print('No voltage value found in the message');
            voltage = 0.0; // Default value if no voltage is found
          }
        } catch (e) {
          print('Error parsing voltage: $e');
          voltage = 0.0; // Set a default value if parsing fails
        }
      });
    });

    // Handle disconnection
    socket.onDisconnect((_) {
      print('Disconnected from server');
    });
  }

  @override
  void dispose() {
    socket.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Statistic Page'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Text(
              'Voltage Statistics',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            ListTile(
              title: const Text('Topic Voltage'),
              trailing: Text(
                '${voltage.toStringAsFixed(2)} V',
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
