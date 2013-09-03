using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using Newtonsoft.Json.Linq;
using System.Net;

namespace xio.js.spec
{
    public class KeyValueStoreController : ApiController
    {
        static Dictionary<string, object> _values = new Dictionary<string, object>(); 

        public object Get(string key)
        {
            return Get(key, "GET");
        }
        public object Get(string key, string method)
        {
            switch (method.ToUpper())
            {
                case "DELETE":
                    Delete(key);
                    return null;
                case "GET":
                    if (!_values.ContainsKey(key))
                    {
                        throw new HttpResponseException(HttpStatusCode.NotFound);
                    }
                    return _values[key];
                case "CLEAR":
                    Clear();
                    return null;
                default:
                    throw new ArgumentException("method");
            }
        }

        public string Post(string key, [FromBody]JObject value)
        {
            // since "0" is an invalid key as is null or empty string, treat both as though a new key is needed
            if (key == null || key == "0" || key == "")
            {
                key = (new Random()).Next(100000000).ToString();
            
            }

            // since this key/value store API is being used with either a value or a model,
            // identify if just value as name; this is just a local hack for Newtonsoft / JObject
            if (value.Properties().Count() == 1 && value.Properties().First().Value.ToString() == "")
            {
                var val = value.Properties().First().Name;
                _values.Add(key, val);
            }

            else _values.Add(key, value);
            return key; // return the key, whether provided or generated
        }

        public void Put(string key, [FromBody]JObject value)
        {

            if (!_values.ContainsKey(key))
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }
            
            // since this key/value store API is being used with either a value or a model,
            // identify if just value as name; this is just a local hack for Newtonsoft / JObject
            if (value.Properties().Count() == 1 && value.Properties().First().Value.ToString() == "")
            {
                var val = value.Properties().First().Name;
                _values[key] = val;
            }
            else  _values[key] = value;
        }

        public object Patch(string key, object value)
        {
            if (!_values.ContainsKey(key))
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }
            var dynval = (dynamic) value;
            var item = (dynamic)_values[key];
            foreach (var field in dynval.Keys)
            {
                item[field] = dynval[field];
            }
            return item;
        }

        public void Delete(string key)
        {
            if (!_values.ContainsKey(key))
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }
            _values.Remove(key);
        }

        public void Clear()
        {
            _values.Clear();
        }
    }
}