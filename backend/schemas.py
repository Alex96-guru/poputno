from pydantic import BaseModel, Field


class Person(BaseModel):
    id: str
    name: str
    company_type: str = Field(..., alias="companyType")
    location: str
    dates: str
    description: str
    rating: float
    photo_url: str = Field(..., alias="photoUrl")

    model_config = {"populate_by_name": True}