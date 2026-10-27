from app.engine.schema import Module, Verdict, VerdictResult


def test_verdict_always_requires_bank_confirmation():
    result = VerdictResult(module=Module.PAYMENT, verdict=Verdict.MATCH)
    assert result.requires_bank_confirmation is True
