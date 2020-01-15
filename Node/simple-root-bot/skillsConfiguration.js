// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * A helper class that loads Skills information from configuration.
 */
class SkillsConfiguration {
    constructor() {
        this.skillsData = {};

        // Note: we only have one skill in this sample but we could load more if needed.
        const botFrameworkSkill_JAVASCRIPT = {
            id: process.env.SkillId_JAVASCRIPT,
            appId: process.env.SkillAppId_JAVASCRIPT,
            skillEndpoint: process.env.SkillEndpoint_JAVASCRIPT
        };
        
        const botFrameworkSkill_DOTNET = {
            id: process.env.SkillId_DOTNET,
            appId: process.env.SkillAppId_DOTNET,
            skillEndpoint: process.env.SkillEndpoint_DOTNET
        };
        
        const botFrameworkSkill_PYTHON = {
            id: process.env.SkillId_PYTHON,
            appId: process.env.SkillAppId_PYTHON,
            skillEndpoint: process.env.SkillEndpoint_PYTHON
        };
        
        const botFrameworkSkill_DOTNETV3 = {
            id: process.env.SkillId_DOTNETV3,
            appId: process.env.SkillAppId_DOTNETV3,
            skillEndpoint: process.env.SkillEndpoint_DOTNETV3
        };

        this.skillsData[botFrameworkSkill_JAVASCRIPT.id] = botFrameworkSkill_JAVASCRIPT;
        this.skillsData[botFrameworkSkill_DOTNET.id] = botFrameworkSkill_DOTNET;
        this.skillsData[botFrameworkSkill_PYTHON.id] = botFrameworkSkill_PYTHON;
        this.skillsData[botFrameworkSkill_DOTNETV3.id] = botFrameworkSkill_DOTNETV3;

        this.skillHostEndpointValue = process.env.SkillHostEndpoint;
        if (!this.skillHostEndpointValue) {
            throw new Error('[SkillsConfiguration]: Missing configuration parameter. SkillHostEndpoint is required');
        }
    }

    get skills() {
        return this.skillsData;
    }

    get skillHostEndpoint() {
        return this.skillHostEndpointValue;
    }
}

module.exports.SkillsConfiguration = SkillsConfiguration;
