<template>
    <el-card class="home">
        <template #header> Home </template>
        <el-row>
            <el-col :xs="12" :sm="6">
                <home-card label="Article" :value="staticsData.articleCount">
                    <img src="../../assets/svg/article.svg" alt="" class="cardImg">
                </home-card>
            </el-col>
            <el-col :xs="12" :sm="6">
                <home-card label="Category" :value="staticsData.categoryCount">
                    <img src="../../assets/svg/category.svg" alt="" class="cardImg">
                </home-card>
            </el-col>
            <el-col :xs="12" :sm="6">
                <home-card label="Tag" :value="staticsData.tagCount">
                    <img src="../../assets/svg/tag.svg" alt="" class="cardImg">
                </home-card>
            </el-col>
            <el-col :xs="12" :sm="6">
                <home-card label="User" :value="staticsData.userCount">
                    <img src="../../assets/svg/user.svg" alt="" class="cardImg">
                </home-card>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <CodeMap :options="options" />
            </el-col>
        </el-row>
    </el-card>
</template>
<script lang="ts" setup>
import CodeMap from '@/components/home/CodeMap.vue'
import HomeCard from '@/components/home/HomeCard.vue'
import { onMounted, reactive, ref } from 'vue'
import { getStatistic } from '@/api/site'
import { formatDateYM } from "@/utils/formatDateYM";

const staticsData = ref({
    articleCount: 0,
    categoryCount: 0,
    tagCount: 0,
    userCount: 0,
    commitList: []
})

let options = ref({})

const getStatisticData = async () => {
    const res = await getStatistic();
    Object.assign(staticsData.value, res)
    console.log(staticsData.value);
    const endTime = formatDateYM(new Date(new Date().setDate(new Date().getDay() - new Date().getDay() + 1)))

    const startTime = formatDateYM(new Date(new Date().setMonth(new Date(endTime).getMonth() - 3)))

    options.value = {
        title: {
            top: 10,
            left: 'center',
            text: 'Daily Article Count'
        },
        tooltip: {
            formatter: function (params) {
                return params.value[0] + " : " + params.value[1];
            }
        },
        visualMap: {
            show: false,
            min: 0,
            max: 5,
            inRange: {
                color: ["#ebedf0", "#d6e685", "#8cc665", "#1e6823"]
            }
        },
        calendar: {
            itemStyle: {
                color: "#f1f1f1",
                borderWidth: 3,
                borderColor: "#fff"
            },
            cellSize: ["auto", 18],
            range: [
                startTime,
                endTime
            ],
            splitLine: {
                show: false
            },
            dayLabel: {
                firstDay: 7,
                nameMap: "EN"
            },
            monthLabel: {
                nameMap: [
                    "Jan.",
                    "Feb.",
                    "Mar.",
                    "Ari.",
                    "May.",
                    "Jun.",
                    "Jul.",
                    "Aut.",
                    "Sep.",
                    "Oct.",
                    "Nov.",
                    "Dec."
                ]
            },
            yearLabel: {
                show: false
            }
        },
        series: {
            type: "heatmap",
            coordinateSystem: "calendar",
            data: staticsData.value.commitList
        }
    }
}

onMounted(async () => {
    await getStatisticData()
    // console.log(formatDateYM(new Date(new Date(staticsData.value.commitList[0][0]).setMonth(new Date(staticsData.value.commitList[0][0]).getMonth()-3))));

})

</script>
<style lang="scss" scoped>
.cardImg {
    transition: all 0.3s;
    width: 48px;
    height: 48px;
}

.cardImg:hover {
    transform: scale(1.1);
}
</style>