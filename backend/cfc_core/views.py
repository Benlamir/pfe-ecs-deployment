from django.http import JsonResponse, HttpRequest

def health_check(request: HttpRequest) -> JsonResponse:
    """
    Check the health of the container.
    
    Args:
        request: The incoming HTTP request.
        
    Returns:
        A JSON response indicating the health status.
    """
    return JsonResponse({"status": "ok", "message": "Container is healthy"})
