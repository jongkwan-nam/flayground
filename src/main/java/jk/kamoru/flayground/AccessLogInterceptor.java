package jk.kamoru.flayground;

import java.io.Serializable;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.MDC;
import org.springframework.data.annotation.Id;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.util.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

/**
 * handler 완료 시점에 accesslog형식으로 기록한다.
 * <pre>
 *  public void addInterceptors(InterceptorRegistry registry) {
 *      registry.addInterceptor(new HandlerAccessLogger());
 *  }
 * </pre>
 * @author kamoru
 */
@Slf4j
public class AccessLogInterceptor implements HandlerInterceptor {

	private static final String MDC_STARTTIME = "StartTime";
	private static final String MDC_USERNAME  = "Username";
	
	AccessLogRepository accessLogRepository;
	
	public AccessLogInterceptor(AccessLogRepository accessLogRepository) {
		this.accessLogRepository = accessLogRepository;
	}

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		MDC.put(MDC_STARTTIME, Long.toString(System.currentTimeMillis()));
		User user = getUser(request);
		if (user != null) {
			MDC.put(MDC_USERNAME, user.getUsername());
		}
		return true;
	}

	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
		getAccesslog(request, response, handler, ex);
		MDC.clear();
	}

	private void getAccesslog(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
		final long startTime = Long.parseLong(MDC.get(MDC_STARTTIME));

		Date   logDate     = new Date();
		String remoteAddr  = request.getRemoteAddr();
		String reqMethod   = request.getMethod();
		String requestUri  = request.getRequestURI();
		String contentType = trim(response.getContentType());
		long   elapsedtime = System.currentTimeMillis() - startTime;
		String handlerInfo = "";
		String exceptionInfo = ex == null ? "" : ex.getMessage();
		User   user        = getUser(request);
		int    status      = response.getStatus();

		// for handlerInfo
		if (handler instanceof org.springframework.web.method.HandlerMethod) { // for Controller
			HandlerMethod method = (HandlerMethod) handler;
			handlerInfo = String.format("%s.%s", method.getBean().getClass().getSimpleName(), method.getMethod().getName());
		} 
		else if (handler instanceof org.springframework.web.servlet.resource.ResourceHttpRequestHandler) { // for static resources. No additional information
			// do nothing
		}
		else { // another handler
			handlerInfo = String.format("%s", handler);
		}

		if (contentType.startsWith("image")
				|| handlerInfo.startsWith("ImageRequestHandler")
				|| requestUri.startsWith("/js")
				|| requestUri.startsWith("/css")
				|| requestUri.startsWith("/webjars")) {
			return;
		}
		
		AccessLog accessLog = new AccessLog(
				logDate,
				remoteAddr,
				reqMethod, 
				requestUri,
				contentType,
				elapsedtime,
				handlerInfo,
				exceptionInfo,
				user,
				status);
		
		log.info(accessLog.toConsoleLogString());
		
		if (handlerInfo != null && accessLogRepository != null)
			accessLogRepository.save(accessLog);
	}

	private User getUser(HttpServletRequest request) {
		SecurityContextImpl securityContext = (SecurityContextImpl) request.getSession().getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
		if (securityContext != null)
			return (User) securityContext.getAuthentication().getPrincipal();
		return null;
	}
	
	private String trim(String str) {
		return str == null ? "" : StringUtils.trimWhitespace(str);
	}

}

@Data
class AccessLog implements Serializable {

	private static final long serialVersionUID = FlaygroundApplication.SERIAL_VERSION_UID;

	@Id
    public String id;
    public Date accessDate;
    public String remoteAddr;
    public String method;
    public String requestURI;
    public String contentType;
    public Long elapsedTime;
    public String handlerInfo;
    public String exceptionInfo;
    public User user;
    public Integer status;
    
	public AccessLog(Date accessDate, String remoteAddr, String method, String requestURI, String contentType, Long elapsedTime, String handlerInfo, String exceptionInfo, User user, Integer status) {
		this.accessDate = accessDate;
		this.remoteAddr = remoteAddr;
		this.method = method;
		this.requestURI = requestURI;
		this.contentType = contentType;
		this.elapsedTime = elapsedTime;
		this.handlerInfo = handlerInfo;
		this.exceptionInfo = exceptionInfo;
		this.user = user;
		this.status = status;
	}

	public String toConsoleLogString() {
		return String.format("%s - %4sms - %-5s - %-30s [%s] [%s] %s", status, elapsedTime, method, requestURI, contentType, handlerInfo, exceptionInfo);
	}
 
}

