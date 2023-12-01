<template>
    <div ref="textOverflowRef" :style="boxStyle">
        <span class="keep" ref="overEllipsisRef">{{ realText }}</span>
        <span class="slot-box" ref="slotRef" v-if="showSlotNode">
            <slot :click-toggle="toggle" :expanded="expanded" ></slot>
        </span>
    </div>
</template>

<script setup lang='ts'>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'

interface Props {
    text: string,
    maxLines: number,
    width: number,
    fontSize: number
}
const props = withDefaults(defineProps<Props>(), {
    text: '',
    maxLines: 3,
    width: 0,
    fontSize: 14
}) 

const expanded = ref(false)
const showSlotNode = ref(false)
const textOverflowRef = ref(null)
const slotRef = ref(null)
const overEllipsisRef = ref(null)

const offset = ref(props.width)
const slotBoxWidth = ref(0)
const textBoxWidth = ref(props.width)

const boxStyle = computed(() => {
    if (props.width) {
        return {
            width: props.width + 'px',
            fontSize: props.fontSize + 'px'
        }
    }
})

const realText = computed(() => {
    const isCutOut = offset.value * props.maxLines < props.text.length * props.fontSize + props.fontSize
    let realText = props.text
    if (isCutOut && !expanded.value) {
        realText = props.text.slice(0, offset.value) + '...'
    }
    return realText
})

function calculateOffset(from, to) {
    nextTick(() => {
        if (Math.abs(from - to) <= 1) return
        if (isOverFlow()) {
            to = offset.value
        } else {
            from = offset.value
        }
        offset.value = Math.floor((from + to) / 2)
        calculateOffset(from, to)
    })
}

function isOverFlow() {
    const {len, lastWidth} = getLines()

    if (len < props.maxLines) {
        return false
    }
    if (props.maxLines) {
        const laseLineOver = !!(
            len === props.maxLines &&
            lastWidth + slotBoxWidth.value > textBoxWidth.value
        )
        if (len > props.maxLines || laseLineOver) {
            return true
        }
    }
    return false
}

function getLines() {
    const clientRects = overEllipsisRef.value.getClientRects()

    return {
        len: clientRects.length,
        lastWidth: clientRects[clientRects.length - 1].width
    }
}

function toggle() {
    expanded.value = !expanded.value
}

onMounted(() => {
    const {len} = getLines()
    if (len > props.maxLines) {
        showSlotNode.value = true
        nextTick(() => {
            slotBoxWidth.value = slotRef.value.clientWidth
            textBoxWidth.value = textOverflowRef.value
            calculateOffset(0, props.text.length)
        })
    }
})

</script>

<style lang='scss' scoped>
.slot-box {
  display: inline-block;
}

.keep {
  white-space: pre-line;
}
</style>