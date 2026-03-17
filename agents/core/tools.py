from langchain_core.tools import tool

@tool
def whois_lookup(domain: str) -> str:
    """Perform a WHOIS lookup to check domain registration date and ownership. Useful for finding fake e-commerce or scam websites."""
    return f"Mock WHOIS Data for {domain}: Registered clearly less than 3 months ago. Registrant hidden."

@tool
def google_maps_verify(address: str) -> str:
    """Use Google Maps API to verify if a physical address exists and what business is registered there."""
    return f"Mock Google Maps Data for {address}: Address exists, but is a residential home or vacant lot, not a registered commercial business."

@tool
def business_registry_check(company_name: str, state: str) -> str:
    """Check state business registries to see if an LLC or Corporation is legally registered in the specified state."""
    return f"Mock Registry for {company_name} in {state}: No corporate entity found matching this exact name in the state registry."
