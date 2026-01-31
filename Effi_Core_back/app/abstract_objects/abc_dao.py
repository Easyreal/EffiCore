from abc import ABCMeta, abstractmethod



class BaseDAO(metaclass=ABCMeta):
    model = None


    @abstractmethod
    async def add_one(cls, user_data, hashed_pass):
        raise NotImplementedError()


    @abstractmethod
    async def get_by_filter_or_none(cls, **filter_by):
        raise NotImplementedError()


    @abstractmethod
    async def get_by_id(cls, user_id):
        raise NotImplementedError()
