<!-- Copyright (c) Microsoft Corporation. -->
<!-- Licensed under the MIT License. -->

<template>
    <fluent-dialog :hidden="!isEmbedConfigDialogVisible">
        <div class="dialog-header">
            <h2 class="dialog-title">Use your own Microsoft Entra token</h2>
            <button class="close-icon-button" @click="hideEmbedConfigDialog">&#x2715;</button>
        </div>
        <div class="dialog-main">
            <p>Follow the <a href="https://learn.microsoft.com/power-bi/developer/embedded/embed-tokens?tabs=embed-for-customers#microsoft-entra-token" target="_blank">Microsoft Entra Token</a> documentation to generate a Microsoft Entra Token. </p>
            <span>Insert your Microsoft Entra token</span>
            <fluent-text-field class="dialog-field" @input="onAadTokenChange($event)" v-model="aadToken"></fluent-text-field>

            <p>Use the <a href="https://learn.microsoft.com/rest/api/power-bi/reports/get-report-in-group" target="_blank">Get Report In Group</a> REST API to get your embed URL. </p>
            <span>Insert your embed URL</span>
            <fluent-text-field class="dialog-field" @input="onEmbedUrlChange($event)" v-model="embedUrl"></fluent-text-field>
        </div>
        <div class="dialog-buttons">
            <fluent-button appearance="primary" class="run-button" :class="{ 'active': areFieldsFilled }" :disabled="!areFieldsFilled" @click="runConfig">Run</fluent-button>
            <fluent-button appearance="outline" class="close-button" @click="hideEmbedConfigDialog">Close</fluent-button>
        </div>
    </fluent-dialog>
</template>

<script lang="ts">
export default {
    name: 'EmbedConfigDialog',
    props: {
        isEmbedConfigDialogVisible: {
            type: Boolean,
            required: true
        },
    },

    data() {
        return {
            aadToken: '',
            embedUrl: '',
            areFieldsFilled: false
        };
    },

    methods: {
        runConfig(): void {
            this.$emit('embedConfigEvent', { aadToken: this.aadToken, embedUrl: this.embedUrl });
            this.hideEmbedConfigDialog();
        },

        onAadTokenChange(event: Event): void {
            const target = event.target as HTMLInputElement;
            this.aadToken = target.value;
            this.checkFields();
        },

        onEmbedUrlChange(event: Event): void {
            const target = event.target as HTMLInputElement;
            this.embedUrl = target.value;
            this.checkFields();
        },

        checkFields(): void {
            this.areFieldsFilled = this.aadToken.trim() !== '' && this.embedUrl.trim() !== '';
        },

        resetFields(): void {
            this.aadToken = '';
            this.embedUrl = '';
            this.areFieldsFilled = false;
        },

        hideEmbedConfigDialog(): void {
            this.resetFields();
            this.$emit('update:isEmbedConfigDialogVisible', false);
        }
    }
};
</script>

<style>
p {
    margin: 10px 0;
    text-align: start;
}

span {
    font-weight: 500;
}

.dialog-header {
    display: flex;
    justify-content: space-between;
    text-align: start;
}

.dialog-title {
    margin: 10px 0;
}

.close-icon-button {
    background: none;
    border: none;
    color: #000000;
    cursor: pointer;
    font-size: 24px;
    height: 52px;
    margin-right: 0px;
    min-width: unset;
    padding: 0;
    width: 20px;
}

.dialog-main {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
}

.dialog-field {
    margin: 5px 0;
    width: 100%;
}

.dialog-buttons {
    display: flex;
    justify-content: flex-end;
    margin: 15px 0;
}

.dialog-buttons .run-button.active::part(control) {
    background-color: #117865;
    color: white;
}

.dialog-buttons .run-button:disabled {
    background-color: #f0f0f0;
    color: #7a7a7a;
}

.run-button {
    margin: 0 10px;
}

fluent-button {
    border-radius: 5px;
    font-size: 16px;
    font-weight: 500;
    height: 35px;
    width: 88px;
}

fluent-dialog::part(control) {
    height: auto;
    padding: 24px;
}

fluent-text-field::part(root) {
    border: 1px solid #8A8886;
    border-radius: 2px;
    font-size: 16px;
    height: 32px;
}
</style>