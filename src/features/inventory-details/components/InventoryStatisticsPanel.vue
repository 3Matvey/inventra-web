<script setup lang="ts">
import type { InventoryStatisticsDto } from "@/entities/item/types";

defineProps<{
  statistics: InventoryStatisticsDto;
}>();
</script>

<template>
  <div class="stats-layout">
    <div class="stat-tile">
      <span class="muted">Total items</span>
      <strong>{{ statistics.itemsCount }}</strong>
    </div>

    <section class="content-section">
      <h2>Numeric fields</h2>
      <div class="definition-list">
        <div
          v-for="field in statistics.numericFields"
          :key="field.fieldId"
          class="definition-row"
        >
          <strong>{{ field.fieldTitle }}</strong>
          <span>min {{ field.min ?? "—" }} · avg {{ field.average ?? "—" }} · max {{ field.max ?? "—" }}</span>
        </div>
        <span v-if="statistics.numericFields.length === 0" class="muted">
          No numeric fields yet.
        </span>
      </div>
    </section>

    <section class="content-section">
      <h2>Frequent string values</h2>
      <div class="definition-list">
        <div
          v-for="field in statistics.stringFields"
          :key="field.fieldId"
          class="definition-row"
        >
          <strong>{{ field.fieldTitle }}</strong>
          <span>
            {{
              field.mostFrequentValues
                .map((value) => `${value.value} (${value.count})`)
                .join(", ") || "—"
            }}
          </span>
        </div>
        <span v-if="statistics.stringFields.length === 0" class="muted">
          No string statistics yet.
        </span>
      </div>
    </section>
  </div>
</template>
