import pagebookAPI from "./pagebook_api";

const searchApi = async (searchText: string) => {
    try {
        const response = await pagebookAPI.get(`search?searchText=${searchText}`);

        return response.data;
    } catch (error) {
        throw error;
    }
}

export default searchApi;