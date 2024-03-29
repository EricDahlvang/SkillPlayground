#!/usr/bin/env python3
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import os
from typing import Dict
from botbuilder.core.skills import BotFrameworkSkill

""" Bot Configuration """


class DefaultConfig:
    """ Bot Configuration """

    PORT = 3979
    APP_ID = os.environ.get("MicrosoftAppId", "")
    APP_PASSWORD = os.environ.get(
        "MicrosoftAppPassword", ""
    )
    SKILL_HOST_ENDPOINT = "https://YourPublishedPythonSkillParent.azurewebsites.net/api/skills"
    SKILLS = [
        {
           "id": "pva",
           "app_id": "e10ebe00-c2a5-4b50-8194-04275f987b52",
           "skill_endpoint": "https://powervaengine.us-il002.gateway.test.island.powerapps.com/api/runtime/environments/3c2bc497-2fc1-4e7b-ba86-b07cd4c38e4e/bots/new_bot_ea55017ba8a64ad48b3947520252a8de/messages?test=true"
        },
        {
           "id": "python",
           "app_id": "988daa64-932a-4606-95ad-3804cd67e3e2",
           "skill_endpoint": "https://skillschildpython2.azurewebsites.net/api/messages",
        },
        {
           "id": "java",
           "app_id": "9ab5ad22-ef17-4603-95c4-6547a265f96c",
           "skill_endpoint": "https://ericskillseverywherejavaskill.azurewebsites.net/api/messages"
        },
        {
            "id": "dotnet",
            "app_id": "438d1711-7e3d-4139-aef4-24b88fc7da47",
            "skill_endpoint": "https://skillschilddotnet.azurewebsites.net/api/messages",
        },
        {
            "id": "javascript",
            "app_id": "23aa99a8-1992-49ee-81f6-c349df3b4835",
            "skill_endpoint": "https://skillschildnode.azurewebsites.net/api/messages",
        },
        {
            "id": "dotnetv3",
            "app_id": "f0254201-b2ef-494d-965a-ec7c753f8d0b",
            "skill_endpoint": "https://skillschilddotnetv3.azurewebsites.net/api/messages",
        },
    ]

class SkillConfiguration:
    SKILL_HOST_ENDPOINT = DefaultConfig.SKILL_HOST_ENDPOINT
    SKILLS: Dict[str, BotFrameworkSkill] = {
        skill["id"]: BotFrameworkSkill(**skill) for skill in DefaultConfig.SKILLS
    }
