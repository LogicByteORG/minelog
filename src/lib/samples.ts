export const SAMPLE_LOG = [
  "[21:14:02] [main/INFO]: Loading Minecraft 1.21.1 with Fabric Loader 0.16.5",
  "[21:14:02] [main/INFO]: Launching with arguments: --username Kelpie_88 --accessToken eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrZWxwaWUifQ.c2lnbmF0dXJlMTIz",
  "[21:14:03] [main/INFO]: Loading 3 mods:",
  "\t- fabric-api 0.102.0+1.21.1",
  "\t- lithium 0.13.0",
  "\t- sodium 0.6.0",
  "[21:14:04] [main/WARN]: Mod file C:\\Users\\Marta\\AppData\\Roaming\\.minecraft\\mods\\sodium-fabric-0.6.0.jar has no icon",
  "[21:14:07] [Render thread/INFO]: Setting user: Kelpie_88",
  "[21:14:09] [Render thread/INFO]: OpenGL 4.6 NVIDIA 555.85",
  "[21:14:11] [Render thread/WARN]: Missing sound for event: minecraft:item.goat_horn.play",
  "[21:14:16] [Render thread/INFO]: Connecting to 203.0.113.42, 25565",
  "[21:14:17] [Render thread/ERROR]: Failed to load shader pack: pack.zip",
  "java.io.FileNotFoundException: C:\\Users\\Marta\\AppData\\Roaming\\.minecraft\\shaderpacks\\pack.zip",
  "\tat java.base/java.io.FileInputStream.open0(Native Method)",
  "\tat net.irisshaders.iris.Iris.loadPack(Iris.java:412)",
  "[21:14:18] [Render thread/INFO]: Stopping!",
].join("\n");

export const SAMPLE_PRIVATE_LINES = [
  SAMPLE_LOG.split("\n")[1],
  SAMPLE_LOG.split("\n")[6],
  SAMPLE_LOG.split("\n")[10],
].join("\n");

