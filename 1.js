const axios = require("axios");

class ServerClient {
  constructor() {
    this.queue = [];
    this.pushQueue = [];
    this.popQueue = [];
    this.writeInFlight = false;
    this.readerInFlight = false;
  }

  async push(element) {
    return new Promise(async (resolve, reject) => {
      this.pushQueue.push({ element, resolve, reject });

      if (!this.writeInFlight) {
        this.processPushQueue();
      }
    });
  }

  async processPushQueue() {
    this.writeInFlight = true;

    while (this.pushQueue.length > 0) {
      if (this.queue.length >= 10) {
        await this.processPopQueue();
      }

      const { element, resolve } = this.pushQueue.shift();
      this.queue.push(element);

      if (this.queue.length === 10) {
        try {
          await this.sendDataToServer(element);
          resolve();
        } catch (error) {
          reject(error);
        }
      } else {
        resolve();
      }
    }

    this.writeInFlight = false;
  }

  async pop() {
    return new Promise(async (resolve, reject) => {
      this.popQueue.push({ resolve, reject });

      if (!this.readerInFlight) {
        this.processPopQueue();
      }
    });
  }

  async processPopQueue() {
    this.readerInFlight = true;

    while (this.popQueue.length > 0) {
      if (this.queue.length === 0) {
        await this.fetchDataFromServer();
      }

      const { resolve } = this.popQueue.shift();
      const item = this.queue.shift();

      resolve(item);
    }

    this.readerInFlight = false;
  }

  async sendDataToServer(data) {
    try {
      const response = await axios({
        url: "http://localhost:3000",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      });

      return response.status === 200;
    } catch (err) {
      console.log("err:", err);
      return false;
    }
  }

  async fetchDataFromServer() {}
}

const client = new ServerClient();

async function pushData(index) {
  await client.push({ key: index });
}

async function popData() {
  const data = await client.pop();
  console.log("Received: ", data);
}

async function main() {
  await popData();
  await pushData(1);
  await pushData(2);
  await pushData(3);
  await pushData(4);
  await pushData(5);
  await pushData(6);
  await pushData(7);
  await pushData(8);
  await pushData(9);
  await pushData(10);
  await popData();
  await pushData(11);
  await pushData(12);
  await popData();
  await popData();
}

main();
