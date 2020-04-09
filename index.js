(async () => {
  const dgram = require("dgram");
  const net = require("net");
  const os = require("os");
  const { readlinePromise } = require("./utils");
  let history = [];
  const sockets = [];
  const UDPPort = 50601;

  const GET_HISTORY = "GET_HISTORY";
  const HISTORY = "HISTORY";

  const MESSAGE = "MESSAGE";

  console.info("Enter your name");
  const name = await readlinePromise();
  console.info(`Your name is: ${name}\nHave a nice chat!`);

  const UDPclient = dgram.createSocket({ type: "udp4", reuseAddr: true });

  const TCPClient = net.createServer();

  const ifaces = os.networkInterfaces();
  const ifacesArray = [...Object.values(ifaces)].flat(1);

  const { address: userIPAdress, netmask } = ifacesArray.find((interface) => {
    if ("IPv4" !== interface.family || interface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return false;
    }

    return true;
  });

  // exapmle: ['192', "168", "0", "1"]
  const netMaskArray = netmask.split(".");
  const userIpArray = userIPAdress.split(".");

  const broadcastIPAdress = userIpArray
    .map((ipPart, i) => (netMaskArray[i] === "255" ? ipPart : "255"))
    .join(".");

  const IPV4 = 4;

  UDPclient.on("message", (msg, senderInfo) => {
    const msgObj = JSON.parse(msg);
    if (senderInfo.address !== userIPAdress) {
      const socket = new net.Socket();

      socket.connect({
        port: msgObj.TCPPort,
        host: senderInfo.address,
        family: IPV4,
      });
      socket.on("connect", () => {
        console.log("new connection here");
        handleNewConnection(socket, socket.remoteAddress);
      });
    }
  });

  UDPclient.on("listening", async () => {
    UDPclient.setBroadcast(true);
    const address = UDPclient.address();
    console.info(`UDP client listening ${address.address}:${address.port}`);
  });

  UDPclient.bind(UDPPort);

  TCPClient.listen(() => createConnections(TCPClient));
  TCPClient.on("connection", (socket) => {
    if (sockets.length === 0) {
      socket.write(JSON.stringify({ type: GET_HISTORY }));
    }
    console.log("new connection");
    handleNewConnection(socket, socket.remoteAddress.slice(8));
  });

  TCPClient.on("close", () => console.log("close"));

  async function createConnections(TCPClient) {
    const { port: TCPPort } = TCPClient.address();
    UDPclient.send(
      JSON.stringify({ name, TCPPort }),
      UDPPort,
      broadcastIPAdress,
    );
    startChat();
  }

  function startChat() {
    Promise.resolve().then(function resolver() {
      return readlinePromise()
        .then((message) => {
          sockets.forEach((socket) => {
            socket.write(JSON.stringify({ type: MESSAGE, name, message }));
            history.push(
              `${name}(${
                TCPClient.address().address
              }) says: ${message} [${new Date()}]`,
            );
          });
        })
        .then(resolver);
    });
  }
  function handleNewConnection(socket, address) {
    socket.setEncoding("utf8");
    socket.on("data", (data) => {
      handleMessage(data, address, socket);
    });
    sockets.push(socket);
    socket.on("end", (socket) => {
      console.info("connection closed end");
      const socketIndex = sockets.findIndex(
        (arraySocket) => arraySocket === socket,
      );
      sockets.splice(socketIndex, 1);
    });
  }

  function handleMessage(data, address, socket) {
    const { type, name, message } = JSON.parse(data);
    if (type === GET_HISTORY) {
      socket.write(JSON.stringify({ type: HISTORY, history }));
    } else if (type === HISTORY) {
      const { history } = JSON.parse(data);
      history.forEach((message) => console.log(message));
    } else if (type === MESSAGE) {
      const msgStr = `${name}(${address}) says: ${message} [${new Date()}]`;
      console.info(msgStr);
      history.push(msgStr);
    }
  }
})();
