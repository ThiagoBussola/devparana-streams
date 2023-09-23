//import os from 'os';
//import cluster from 'cluster';
const os = require('os');
const cluster = require('cluster');

const runPrimaryProcess = () => {
  const processesCount = os.cpus().length; //* 2;
  console.log(`Primary ${process.pid} is running`);
  console.log(`Forking Server with ${processesCount} processes \n`);

  for (let index = 0; index < processesCount; index++) cluster.fork();

  // Adicionando resiliência a nossa aplicação
  cluster.on('exit', (worker, code, signal) => {
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      console.log(
        `Worker ${worker.process.pid} died... scheduling another one!`,
      );
      cluster.fork();
    }
  });
};

const runWorkerProcess = async () => {
  await import('./main');
};

cluster.isPrimary ? runPrimaryProcess() : runWorkerProcess();
