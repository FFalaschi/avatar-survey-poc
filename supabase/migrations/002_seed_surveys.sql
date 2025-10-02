-- Seed 3 surveys with 5 questions each for AI Agent testing

-- Survey 1: B2B SaaS Product Feedback
INSERT INTO surveys (title, persona_config, questions) VALUES (
  'B2B SaaS Product Feedback Survey',
  jsonb_build_object(
    'name', 'Product Research Specialist',
    'avatarId', 'professional_female_01',
    'voiceId', 'calm_voice_02',
    'systemPrompt', 'You are a product research specialist conducting feedback interviews. Ask each survey question in order. If an answer is vague or incomplete, ask a thoughtful probing follow-up. For rating questions, confirm the exact number. Keep your questions conversational and engaging. After receiving a complete answer, output a machine block: <machine>{"questionId": "Q1", "status": "answered", "answer": {"text": "user response"}}</machine>'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'id', 'Q1',
      'type', 'open',
      'text', 'What is your current role in your organization?',
      'required', true,
      'probes', jsonb_build_array(
        'Can you tell me more about your day-to-day responsibilities?',
        'How long have you been in this role?'
      )
    ),
    jsonb_build_object(
      'id', 'Q2',
      'type', 'choice',
      'text', 'How long have you been using similar tools in your workflow?',
      'choices', jsonb_build_array(
        'Less than 6 months',
        '6 months to 1 year',
        '1-3 years',
        '3-5 years',
        'More than 5 years'
      ),
      'required', true,
      'probes', jsonb_build_array('What specific tools have you used previously?')
    ),
    jsonb_build_object(
      'id', 'Q3',
      'type', 'numeric',
      'text', 'On a scale of 1-10, how likely are you to recommend our product to a colleague?',
      'required', true,
      'probes', jsonb_build_array('What would make you more likely to recommend us?')
    ),
    jsonb_build_object(
      'id', 'Q4',
      'type', 'open',
      'text', 'What feature would have the biggest impact on your productivity?',
      'required', true,
      'probes', jsonb_build_array(
        'Can you describe a specific scenario where this feature would help?',
        'How much time would this save you per week?'
      )
    ),
    jsonb_build_object(
      'id', 'Q5',
      'type', 'open',
      'text', 'What prevents you from using our product more frequently?',
      'required', true,
      'probes', jsonb_build_array(
        'Is this a technical limitation or a workflow issue?',
        'Have you found workarounds for these challenges?'
      )
    )
  )
);

-- Survey 2: Customer Support Experience
INSERT INTO surveys (title, persona_config, questions) VALUES (
  'Customer Support Experience Survey',
  jsonb_build_object(
    'name', 'Customer Success Analyst',
    'avatarId', 'professional_female_01',
    'voiceId', 'calm_voice_02',
    'systemPrompt', 'You are a friendly customer success analyst gathering feedback about recent support interactions. Ask each question warmly and show genuine interest in the customer''s experience. If responses are brief, gently probe for more details. For rating questions, confirm the exact score. After receiving a complete answer, output a machine block: <machine>{"questionId": "Q1", "status": "answered", "answer": {"numeric": 5}}</machine>'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'id', 'Q1',
      'type', 'numeric',
      'text', 'How would you rate your recent support experience on a scale of 1-5?',
      'required', true,
      'probes', jsonb_build_array('What specifically influenced your rating?')
    ),
    jsonb_build_object(
      'id', 'Q2',
      'type', 'choice',
      'text', 'How long did it take to resolve your issue?',
      'choices', jsonb_build_array(
        'Less than 1 hour',
        '1-4 hours',
        '4-24 hours',
        '1-3 days',
        'More than 3 days',
        'Still unresolved'
      ),
      'required', true,
      'probes', jsonb_build_array('Did this meet your expectations for resolution time?')
    ),
    jsonb_build_object(
      'id', 'Q3',
      'type', 'open',
      'text', 'What could we have done better in handling your request?',
      'required', true,
      'probes', jsonb_build_array(
        'Can you give me a specific example?',
        'Was there a particular moment that stood out?'
      )
    ),
    jsonb_build_object(
      'id', 'Q4',
      'type', 'choice',
      'text', 'How knowledgeable was the support representative?',
      'choices', jsonb_build_array(
        'Very knowledgeable',
        'Somewhat knowledgeable',
        'Neutral',
        'Somewhat lacking knowledge',
        'Not knowledgeable at all'
      ),
      'required', true,
      'probes', jsonb_build_array('What made you feel this way?')
    ),
    jsonb_build_object(
      'id', 'Q5',
      'type', 'choice',
      'text', 'Would you contact our support team again if needed?',
      'choices', jsonb_build_array(
        'Definitely yes',
        'Probably yes',
        'Not sure',
        'Probably not',
        'Definitely not'
      ),
      'required', true,
      'probes', jsonb_build_array('What would increase your confidence in reaching out again?')
    )
  )
);

-- Survey 3: Market Research - Tech Adoption
INSERT INTO surveys (title, persona_config, questions) VALUES (
  'Tech Adoption & Decision-Making Survey',
  jsonb_build_object(
    'name', 'Market Research Consultant',
    'avatarId', 'professional_female_01',
    'voiceId', 'calm_voice_02',
    'systemPrompt', 'You are an experienced market research consultant exploring technology adoption patterns. Ask each question thoughtfully, allowing the participant to share their full perspective. When answers are brief or unclear, ask insightful follow-up questions. For numeric responses, confirm the exact value. After receiving a complete answer, output a machine block: <machine>{"questionId": "Q1", "status": "answered", "answer": {"text": "detailed response"}}</machine>'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'id', 'Q1',
      'type', 'open',
      'text', 'What technologies or tools does your team currently use for project management and collaboration?',
      'required', true,
      'probes', jsonb_build_array(
        'How long have you been using these tools?',
        'What do you like most about your current setup?'
      )
    ),
    jsonb_build_object(
      'id', 'Q2',
      'type', 'numeric',
      'text', 'How satisfied are you with your current solution on a scale of 1-10?',
      'required', true,
      'probes', jsonb_build_array(
        'What are the main strengths of your current solution?',
        'What are the biggest pain points?'
      )
    ),
    jsonb_build_object(
      'id', 'Q3',
      'type', 'open',
      'text', 'What would motivate you to switch to a new solution?',
      'required', true,
      'probes', jsonb_build_array(
        'Have you considered switching in the past?',
        'What held you back from making a change?'
      )
    ),
    jsonb_build_object(
      'id', 'Q4',
      'type', 'choice',
      'text', 'What is your typical decision-making process for adopting new technology?',
      'choices', jsonb_build_array(
        'I make the final decision independently',
        'I recommend and others approve',
        'We decide as a team',
        'Someone else decides and I provide input',
        'Someone else decides without my input'
      ),
      'required', true,
      'probes', jsonb_build_array('How long does this process typically take?')
    ),
    jsonb_build_object(
      'id', 'Q5',
      'type', 'choice',
      'text', 'What is your budget range for this type of solution annually?',
      'choices', jsonb_build_array(
        'Less than $1,000',
        '$1,000 - $5,000',
        '$5,000 - $15,000',
        '$15,000 - $50,000',
        '$50,000 - $100,000',
        'More than $100,000',
        'Prefer not to say'
      ),
      'required', true,
      'probes', jsonb_build_array('Is this budget flexible based on ROI?')
    )
  )
);
