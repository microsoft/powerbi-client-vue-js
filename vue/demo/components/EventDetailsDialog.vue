<!-- Copyright (c) Microsoft Corporation. -->
<!-- Licensed under the MIT License. -->

<template>
    <fluent-dialog :hidden="!isEventDetailsDialogVisible">
        <div class="dialog-header-event-details">
            <h1>Event Details</h1>
            <div class="close-icon-button" @click="closeSelectedEventDetailsDialog">&#x2715;</div>
        </div>
        <div class="dialog-main-event-details">
            <pre>{{ dataSelectedEventDetails }}</pre>
        </div>
        <fluent-button class="close-button" @click="closeSelectedEventDetailsDialog">Close</fluent-button>
    </fluent-dialog>
</template>

<script lang="ts">
export default {
    name: 'EventDetailsDialog',
    props: {
        isEventDetailsDialogVisible: {
            type: Boolean,
            required: true
        },
        dataSelectedEventDetails: Object
    },

    methods: {
        closeSelectedEventDetailsDialog(): void {
            this.$emit('update:isEventDetailsDialogVisible', false)
        }
    }
};
</script>

<style scoped>
h1 {
    margin: 10px 0;
}

pre {
    height: 348px;
    margin: 3.5px;
    text-align: start;
}

.close-icon-button {
    align-content: center;
    background: none;
    border: none;
    font-size: 24px;
    color: #000000;
    cursor: pointer;
    padding: 0;
}

.dialog-header-event-details {
    display: flex;
    justify-content: space-between;
    text-align: start;
}

.dialog-main-event-details {
    align-items: flex-start;
    border: 1px solid #e8e8e8;
    display: flex;
    flex-direction: column;
    max-height: 400px;
    overflow-y: auto;
}

fluent-button{
    border: 1px solid #e8e8e8;
    border-radius: 5px;
    float: right;
    font-size: 16px;
    font-weight: 500;
    height: 35px;
    margin-top:14px;
    width: 88px;
}

fluent-dialog::part(control) {
    min-width: 300px;
    padding: 24px;
}
</style>