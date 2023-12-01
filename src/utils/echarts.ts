import * as echarts from 'echarts/core'
import { GraphicComponent, GridComponent, LegendComponent, PolarComponent, TitleComponent, TooltipComponent, VisualMapComponent, CalendarComponent } from 'echarts/components'
import { BarChart, BoxplotChart, LineChart, PieChart, RadarChart, HeatmapChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
    GraphicComponent,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    LineChart,
    BarChart,
    PieChart,
    BoxplotChart,
    CanvasRenderer,
    UniversalTransition,
    RadarChart,
    PolarComponent,
    VisualMapComponent, 
    CalendarComponent,
    HeatmapChart
])

const draw = (dom: HTMLElement, option: Record<string, any>) => {
    const chart = echarts.init(dom)
    chart.clear()
    chart.setOption(option)
    return chart
}

export default {
    ...echarts,
    draw
} as any