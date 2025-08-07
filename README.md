

## Notes [Temp]

- Run postgres docker container
```
docker run --name postgres_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

- DebugNote: passing `seed` as the last argument of the function to derive PDA somehow messed up the creation of the PDA.
  - No reason known why, but this might be related to LE ?

- Used Gill and Codama

## TODOs

- [ ]  Adopt Gill instead of Web3js




