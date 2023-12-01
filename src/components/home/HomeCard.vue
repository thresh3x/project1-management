<template>
    <el-card style="margin: 5px;">
        <div class="flex">
            <div class="icon">
                <slot></slot>
            </div>
            <div class="flex">
                <span class="label">{{ props.label }}</span>
                <div class="value">{{ props.value }}</div>
            </div>
        </div>
    </el-card>
</template>

<script setup lang='ts'>
const props = defineProps({
    label: {
        type: String,
        default: ""
    },
    value: {
        type: [String, Number],
        default: ""
    }
})
</script>

<style lang='scss' scoped>
.flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.label {
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  margin-right: 5px;
}

.value {
  font-size: 1.6rem;
  font-weight: 600;
  cursor: pointer;
}

.icon {
  width: 48px;
  height: 48px;
  cursor: pointer;
}
</style>