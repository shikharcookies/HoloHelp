import { labelMap } from '@/data/labelMap'

export function mapLabelToDevice(label) {
  const lowerLabel = label.toLowerCase()
  for (const [device, aliases] of Object.entries(labelMap)) {
    if (aliases.includes(lowerLabel)) {
      return device
    }
  }
  return null
}
