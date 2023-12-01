<template>
    <el-skeleton :loading="loading" animated :throttle="1000">
        <template #default>
            <div ref="codeMapChartRef" class="ref" />
        </template>
    </el-skeleton>
</template>

<script setup lang='ts'>
import { ref, computed, watch, type Ref, onMounted, nextTick, onUnmounted } from 'vue'
import type { ECharts } from 'echarts/core';
import echarts from '@/utils/echarts';

const props = defineProps({
    options: {
        type: Object,
        default: null
    }
})

const loading = ref(true)

const codeMapChartRef = ref(null)
let chartObj: null | ECharts = null
let observer: null | ResizeObserver = null

const drawOption = () => {
    if (!chartObj) return
    chartObj.hideLoading()
    chartObj.setOption(props.options)
}

onMounted(() => {
    if (!chartObj && codeMapChartRef.value) {    
        chartObj = (echarts.init(codeMapChartRef.value) as any)
        loading.value = false
    }

    if (!chartObj) return
    !props.options && chartObj.showLoading({
        text: '',
        color: '#409eff',
        textColor: '#000',
        maskColor: 'rgba(255, 255, 255, .95)',
        zlevel: 0,
        lineWidth: 2,
    })
    if (props.options) {
        drawOption()
    }

    observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
            if (entry.target === codeMapChartRef.value) {
                chartObj && chartObj.resize()
            }
        }
    })

    nextTick(() => {
        codeMapChartRef.value && (observer as ResizeObserver).observe(codeMapChartRef.value)
    })

    setTimeout(() => {
        chartObj && chartObj.resize()
    }, 1000)
})

onUnmounted(() => {
    if (chartObj) {
        chartObj.dispose()
        chartObj = null
    }
    observer && observer.disconnect()
})

watch(() => props.options, () => drawOption())

</script>

<style lang='scss' scoped>
.ref {
    width: 100%;
    height: 50vh;
}
</style>