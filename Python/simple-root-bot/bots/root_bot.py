from typing import List

from botbuilder.core import (
    ActivityHandler,
    BotFrameworkHttpClient,
    CardFactory,
    ConversationState,
    MessageFactory,
    TurnContext,
)

from botbuilder.schema import (
    Attachment,
    ActivityTypes,
    ChannelAccount,
    CardAction,
    HeroCard,
)

from config import DefaultConfig, SkillConfiguration

ACTIVE_SKILL_PROPERTY_NAME = "activeSkillProperty"

class RootBot(ActivityHandler):
    def __init__(
        self,
        conversation_state: ConversationState,
        skills_config: SkillConfiguration,
        skill_client: BotFrameworkHttpClient,
        config: DefaultConfig,
    ):
        self._bot_id = config.APP_ID
        self._skill_client = skill_client
        self._skills_config = skills_config
        self._conversation_state = conversation_state
        self._active_skill_property = conversation_state.create_property(
            "activeSkillProperty"
        )

    async def on_turn(self, turn_context: TurnContext):
        if turn_context.activity.type == ActivityTypes.end_of_conversation:
            # Handle end of conversation back from the skill
            # forget skill invocation
            await self._active_skill_property.delete(turn_context)
            await self._conversation_state.save_changes(turn_context, force=True)

            # We are back
            await turn_context.send_activity(
                MessageFactory.text("Hi. Back in the root bot.")
            )

            await turn_context.send_activity(
                MessageFactory.attachment(CardFactory.hero_card(self._get_hero_card()))
            )
        else:
            await super().on_turn(turn_context)

    async def on_message_activity(self, turn_context: TurnContext):
        # If there is an active skill
        active_skill: str = await self._active_skill_property.get(turn_context)

        if active_skill:
            # NOTE: Always SaveChanges() before calling a skill so that any activity generated by the skill
            # will have access to current accurate state.
            await self._conversation_state.save_changes(turn_context, force=True)

            # route activity to the skill
            await self._skill_client.post_activity(
                self._bot_id,
                active_skill,
                self._skills_config.SKILL_HOST_ENDPOINT,
                turn_context.activity,
            )
        else:
            text = turn_context.activity.text
            if "dotnet" in text or "javascript" in text or "python" in text:
                await turn_context.send_activity(
                    MessageFactory.text("Got it, connecting you to the skill...")
                )

                active_skill = self._skills_config.SKILLS[text]
                # save ConversationReferene for skill
                await self._active_skill_property.set(turn_context, active_skill)

                # NOTE: Always SaveChanges() before calling a skill so that any activity generated by the
                # skill will have access to current accurate state.
                await self._conversation_state.save_changes(turn_context, force=True)

                await self._skill_client.post_activity(
                    self._bot_id,
                    active_skill,
                    self._skills_config.SKILL_HOST_ENDPOINT,
                    turn_context.activity,
                )
            else:
                # just respond
                await turn_context.send_activity(MessageFactory.text("Me no nothin'."))
                await turn_context.send_activity(
                    MessageFactory.attachment(
                        CardFactory.hero_card(self._get_hero_card())
                    )
                )

    async def on_members_added_activity(
        self, members_added: List[ChannelAccount], turn_context: TurnContext
    ):
        for member in members_added:
            if member.id != turn_context.activity.recipient.id:
                await turn_context.send_activity(
                    MessageFactory.text("Hello and welcome!")
                )

    def _get_hero_card(self) -> Attachment:
        return HeroCard(
            title="Python Skills Bot Options",
            text="Click one of the buttons below to initiate that echo skill.",
            buttons=[
                CardAction(
                    type="imBack", title="Dotnet Skill", text="dotnet", value="dotnet"
                ),
                CardAction(
                    type="imBack",
                    title="Javascript Skill",
                    text="javascript",
                    value="javascript",
                ),
                CardAction(
                    type="imBack", title="Python Skill", text="python", value="python"
                ),
                CardAction(
                    type="imBack", title="Dotnet V3 Skill", text="dotnetv3", value="dotnetv3"
                ),
            ],
        )