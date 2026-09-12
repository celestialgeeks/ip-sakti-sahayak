"""
ABS Helper — Access and Benefit Sharing compliance checker.
"""

from app.models.schemas import ABSCheckResponse, ABSCheckItem


def check_abs_compliance(
    biological_resource: str,
    source_location: str = "",
    commercial_use: bool = True,
    involves_traditional_knowledge: bool = False,
) -> ABSCheckResponse:
    """
    Check ABS compliance requirements under the Biological Diversity Act, 2002 (amended 2023).
    Returns a checklist of requirements and guidance.
    """
    checklist = []

    # 1. NBA/SBB Approval
    if commercial_use:
        checklist.append(ABSCheckItem(
            requirement="NBA Approval for Commercial Utilisation",
            status="required",
            guidance=(
                "Under Section 3 of the Biological Diversity Act, 2002, prior approval from the "
                "National Biodiversity Authority (NBA) is required for access to biological resources "
                "for commercial utilisation. File Form I with the NBA."
            ),
        ))
    else:
        checklist.append(ABSCheckItem(
            requirement="SBB Intimation for Research",
            status="required",
            guidance=(
                "Under Section 7, Indian researchers must give prior intimation to the "
                "State Biodiversity Board (SBB) before accessing biological resources for research."
            ),
        ))

    # 2. Benefit Sharing Agreement
    checklist.append(ABSCheckItem(
        requirement="Benefit Sharing Agreement",
        status="required" if commercial_use else "optional",
        guidance=(
            "Under the 2024 BD Rules, benefit sharing terms must be agreed upon. "
            "This may include monetary payments (royalties, upfront fees) or non-monetary "
            "benefits (technology transfer, capacity building)."
        ),
    ))

    # 3. Traditional Knowledge
    if involves_traditional_knowledge:
        checklist.append(ABSCheckItem(
            requirement="Consent from Local Communities",
            status="required",
            guidance=(
                "If the product utilises traditional knowledge associated with biological resources, "
                "prior informed consent from the concerned local community/BMC is required under Section 36."
            ),
        ))

    # 4. Biodiversity Management Committee
    checklist.append(ABSCheckItem(
        requirement="BMC Register Cross-Reference",
        status="required",
        guidance=(
            "Check the People's Biodiversity Register (PBR) maintained by the local "
            "Biodiversity Management Committee (BMC) for documentation of the biological resource."
        ),
    ))

    all_required_met = all(item.status != "required" for item in checklist)

    return ABSCheckResponse(
        compliant=all_required_met,
        checklist=checklist,
        guidance=(
            f"For the biological resource '{biological_resource}': "
            f"{len([c for c in checklist if c.status == 'required'])} mandatory requirements identified. "
            "Complete all requirements before commercial utilisation."
        ),
    )
