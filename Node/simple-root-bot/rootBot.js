// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, ActionTypes, ActivityTypes, CardFactory, MessageFactory  } = require('botbuilder');

class RootBot extends ActivityHandler {
    constructor(conversationState, skillsConfig, skillClient) {
        super();
        if (!conversationState) throw new Error('[RootBot]: Missing parameter. conversationState is required');
        if (!skillsConfig) throw new Error('[RootBot]: Missing parameter. skillsConfig is required');
        if (!skillClient) throw new Error('[RootBot]: Missing parameter. skillClient is required');

        this.conversationState = conversationState;
        this.skillsConfig = skillsConfig;
        this.skillClient = skillClient;

        this.botId = process.env.MicrosoftAppId;
        if (!this.botId) {
            throw new Error('[RootBot] MicrosoftAppId is not set in configuration');
        }

        // Create state property to track the active skill
        this.activeSkillProperty = this.conversationState.createProperty('activeSkillProperty');

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            // Try to get the active skill
            let activeSkill = await this.activeSkillProperty.get(context);

            if (activeSkill) {
                // Send the activity to the skill
                await this.sendToSkill(context, activeSkill);
            } else {

                const text = context.activity.text.toLowerCase();
                if (text.includes('dotnet') || text.includes('javascript') || text.includes('python')) {
                    activeSkill = this.skillsConfig.skills[text];
                    await context.sendActivity('Got it, connecting you to the skill...');

                    // Set active skill
                    await this.activeSkillProperty.set(context, activeSkill);

                    // Send the activity to the skill
                    await this.sendToSkill(context, activeSkill);
                } else {
                    const card = this.getOptionsCard();
                    const message = MessageFactory.attachment(card);
                    await context.sendActivity(message);
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onUnrecognizedActivityType(async (context, next) => {
            // Handle EndOfConversation returned by the skill.
            if (context.activity.type === ActivityTypes.EndOfConversation) {
                // Stop forwarding activities to Skill.
                await this.activeSkillProperty.set(context, undefined);

                // Show status message, text and value returned by the skill
                let eocActivityMessage = `Received ${ ActivityTypes.EndOfConversation }.\n\nCode: ${ context.activity.code }`;
                if (context.activity.text) {
                    eocActivityMessage += `\n\nText: ${ context.activity.text }`;
                }

                if (context.activity.value) {
                    eocActivityMessage += `\n\nValue: ${ context.activity.value }`;
                }

                await context.sendActivity(eocActivityMessage);

                // We are back at the root
                await context.sendActivity('Back in the root javascript bot.');
                const card = this.getOptionsCard();
                const message = MessageFactory.attachment(card);
                await context.sendActivity(message);

                // Save conversation state
                await this.conversationState.saveChanges(context, true);
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    getOptionsCard() {
        const buttons = [
            { type: ActionTypes.ImBack, title: 'Dotnet Skill', value: 'dotnet' },
            { type: ActionTypes.ImBack, title: 'Javascript Skill', value: 'javascript' },
            { type: ActionTypes.ImBack, title: 'Python Skill', value: 'python' },
            { type: ActionTypes.ImBack, title: 'Dotnet V3 Skill', value: 'dotnetv3' }
        ];

        const card = CardFactory.heroCard('Javascript Skills Bot Options', undefined,
            buttons, { text: 'You can upload an image or select one of the following choices.' });

        return card;
    }

    async sendToSkill(context, targetSkill) {
        // NOTE: Always SaveChanges() before calling a skill so that any activity generated by the skill
        // will have access to current accurate state.
        await this.conversationState.saveChanges(context, true);

        // route the activity to the skill
        const response = await this.skillClient.postToSkill(this.botId, targetSkill, this.skillsConfig.skillHostEndpoint, context.activity);

        // Check response status
        if (!(response.status >= 200 && response.status <= 299)) {
            throw new Error(`[RootBot]: Error invoking the skill id: "${ targetSkill.id }" at "${ targetSkill.skillEndpoint }" (status is ${ response.status }). \r\n ${ response.body }`);
        }
    }
}

module.exports.RootBot = RootBot;
