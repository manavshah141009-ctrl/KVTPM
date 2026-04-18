# Radio Worker — Azure App Service Deployment
# =============================================
# This WebJob runs the radio worker as a continuous background service
# alongside your Azure App Service.

# Azure App Service WebJob structure:
# App_Data/
#   jobs/
#     continuous/
#       radio-worker/
#         run.sh   (Linux) or run.cmd (Windows)
#         index.mjs

# The radio-worker/index.mjs is the actual worker.
# Copy this folder structure relative to your App Service root.

echo "Starting KVTP Radio Worker..."
node /home/site/wwwroot/radio-worker/index.mjs
