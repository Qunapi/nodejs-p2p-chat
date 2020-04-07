const dgram = require("dgram");
const readline = require("readline");

const UDPPort = 50601;
const TCPPort = 50602;
const TCP

const rl = readline.createInterface({
  input: process.stdin,
});

function readlinePromise(message = "") {
  return new Promise((resolve, reject) => {
    rl.question(message, (input) => {
      resolve(input);
    });
  });
}

const UDPclient = dgram.createSocket({ type: 'udp4', reuseAddr: true });


UDPclient.on("error", (err) => {
  console.log(`server error:\n${err.stack}`);
  UDPclient.close();
});

UDPclient.on("message", (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

UDPclient.on("listening", async () => {
  UDPclient.setBroadcast(true);
  const address = UDPclient.address();
  console.log(`server listening ${address.address}:${address.port}`);
  console.log("Enter your name");
  const name = await readlinePromise();
  console.log(`Your name is: ${name}\nHave a nice chat!`);
  Promise.resolve()
    .then(function resolver() {
      return readlinePromise()
        .then((message) =>
          UDPclient.send(
            `${JSON.stringify({ name, message })}`,
            UDPPort,
            "192.168.1.255",
          ),
        )
        .then(resolver);
    })
    .catch((error) => {
      console.log(`Error: ${error}`);
    });
});

UDPclient.bind(UDPPort);
