import uvicorn
from starlette.middleware.cors import CORSMiddleware
from app.user.router import router as user_router
from app.verification.router import router as verification_router
from fastapi import FastAPI
from .database import engine, Base
app = FastAPI()

app.include_router(user_router)

app.include_router(verification_router)

origins = [
    'http://localhost:8000'
    'http://127.0.0.1:8000'
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

# app/main.py


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'OPTIONS', 'DELETE', 'PATCH', 'PUT'],
    allow_headers=['Content-Type', 'Set-Cookie', 'Access-Control-Allow-Headers',
                   'Access-Contol-Allow-Origin', 'Authorization' ]
)

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)