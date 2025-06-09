# Pre-requisites for Google's image generation models

Before using this application with Google's image generation models, you need to satisfy the following pre-conditions:
1. `gcloud` (Google Cloud CLI) is installed and authenticated
2. GCP Project is created and biling is enabled
3. Vertex AI API is enabled
4. The application is configured to use the created GCP Project

## Setup Instructions

### 1. Install `gcloud` CLI and

See [Install gcloud CLI](https://cloud.google.com/sdk/docs/install)

### 2. Create Google Cloud Project and enable billing

See [Create a Google Cloud Project](https://developers.google.com/workspace/guides/create-project#google-cloud-console). It also shows how to enable billing for the project.

### 3. Enable Vertex AI API

See [Set up a project and a development environment | Vertex AI](https://cloud.google.com/vertex-ai/docs/start/cloud-environment) to see how to enable Vertex AI API.

### 4. Configure the the application to use the GCP Project

Run `gcloud auth application-default login`

## Reference: Authentication Command Differences

### `gcloud auth login`
- **Purpose**: Authenticates your Google Cloud CLI (`gcloud`) commands
- **Usage**: Used for running `gcloud` commands from the command line
- **Authentication scope**: Only affects `gcloud` CLI operations
- **Storage**: Stores credentials for CLI use only

### `gcloud auth application-default login`
- **Purpose**: Sets up Application Default Credentials (ADC) for applications and SDKs
- **Usage**: Used by applications and client libraries (like Python SDK) to authenticate with Google Cloud services
- **Authentication scope**: Affects applications that use Google Cloud client libraries
- **Storage**: Stores credentials that applications can automatically discover and use

### When to use which command:
- Use `gcloud auth login` when you need to run `gcloud` CLI commands
- Use `gcloud auth application-default login` when your application needs to access Google Cloud services programmatically
- For this mulmocast CLI application, you need `gcloud auth application-default login` because the application uses Google Cloud client libraries to interact with Vertex AI API

### Note:
Both commands can be used together. Many developers run both commands to ensure they can use both CLI tools and applications seamlessly. You may use `gcloud auth login --update-adc` for short instead of running both commands.
