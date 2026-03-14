export function chunkIntoPackets<T>(items: T[], size = 6): T[][] {
  const packets: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    packets.push(items.slice(i, i + size));
  }
  return packets;
}
