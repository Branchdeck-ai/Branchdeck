"""
Branchdeck AI Model Pricing Configuration
Last verified against official provider pricing pages on: 2026-09-08
Sources:
- OpenAI: https://openai.com/api/pricing
- Anthropic: https://anthropic.com/pricing
- Google Gemini: https://ai.google.dev/pricing
"""

from typing import Dict, Any

# Published rates per 1,000,000 tokens (USD)
MODEL_PRICING_PER_1M: Dict[str, Dict[str, Any]] = {
    # OpenAI
    "gpt-4o-mini": {
        "provider": "openai",
        "input_per_1m": 0.15,
        "output_per_1m": 0.60,
    },
    "gpt-4o": {
        "provider": "openai",
        "input_per_1m": 2.50,
        "output_per_1m": 10.00,
    },
    
    # Anthropic
    "claude-3-5-haiku": {
        "provider": "anthropic",
        "input_per_1m": 0.80,
        "output_per_1m": 4.00,
    },
    "claude-haiku-4.5": {
        "provider": "anthropic",
        "input_per_1m": 0.80,
        "output_per_1m": 4.00,
    },
    "claude-3-5-sonnet": {
        "provider": "anthropic",
        "input_per_1m": 3.00,
        "output_per_1m": 15.00,
    },
    "claude-sonnet": {
        "provider": "anthropic",
        "input_per_1m": 3.00,
        "output_per_1m": 15.00,
    },
    
    # Google Gemini
    "gemini-2.5-flash": {
        "provider": "google",
        "input_per_1m": 0.075,
        "output_per_1m": 0.30,
    },
    "gemini-1.5-flash": {
        "provider": "google",
        "input_per_1m": 0.075,
        "output_per_1m": 0.30,
    },
}

DEFAULT_MODEL = "gemini-2.5-flash"

def get_model_info(model: str) -> Dict[str, Any]:
    """Retrieve pricing metadata and provider name for a given model alias."""
    norm = (model or "").lower().strip()
    if norm in MODEL_PRICING_PER_1M:
        return MODEL_PRICING_PER_1M[norm]
    
    if "gpt-4o-mini" in norm:
        return MODEL_PRICING_PER_1M["gpt-4o-mini"]
    elif "gpt-4o" in norm:
        return MODEL_PRICING_PER_1M["gpt-4o"]
    elif "haiku" in norm:
        return MODEL_PRICING_PER_1M["claude-3-5-haiku"]
    elif "sonnet" in norm:
        return MODEL_PRICING_PER_1M["claude-3-5-sonnet"]
    elif "flash" in norm or "gemini" in norm:
        return MODEL_PRICING_PER_1M["gemini-2.5-flash"]
    
    return MODEL_PRICING_PER_1M[DEFAULT_MODEL]

def get_provider_for_model(model: str) -> str:
    """Return provider identifier ('openai', 'anthropic', or 'google') for a model."""
    return get_model_info(model)["provider"]

def calculate_model_cost(model: str, tokens_in: int, tokens_out: int) -> float:
    """Calculate exact USD cost for a model based on prompt and completion token counts."""
    info = get_model_info(model)
    input_cost = (tokens_in / 1_000_000.0) * info["input_per_1m"]
    output_cost = (tokens_out / 1_000_000.0) * info["output_per_1m"]
    cost = round(input_cost + output_cost, 6)
    return max(cost, 0.000001)
