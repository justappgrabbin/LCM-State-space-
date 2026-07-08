# LCM State Space

This repository includes a GitHub Actions workflow that safely extracts committed ZIP archives.

## How it works

- Keep your original `.zip` files in the repo.
- Push them to `main`.
- GitHub Actions runs automatically.
- Each archive is extracted into:

```txt
extracted/<zip-file-name>/
```

## Manual run

You can also run the workflow manually:

1. Open the **Actions** tab.
2. Select **Unzip Archives**.
3. Click **Run workflow**.

## Safety notes

- Original ZIP files are not deleted.
- Extracted files are committed back into the repo.
- Existing extracted files are not overwritten.
