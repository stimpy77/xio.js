using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using WebAPI.OutputCache;

namespace xio.js.spec
{
    public class CachedSampleController : ApiController
    {
        [CacheOutput(ClientTimeSpan=5,  NoCache=false)]
        public string Get()
        {
            return DateTime.Now.Ticks.ToString();
        }

        [AcceptVerbs("POST")]
        public void Invalidate()
        {
            var url = "/spec/svr/CachedSample";
            HttpContext.Current.Response.AddHeader("X-Invalidate-Cache-Item", url + ";" + url + "/");
        }
    }
}